//! Config drift watch: the k8s Secret this process was configured from is
//! mounted as a directory of files, so — unlike the environment, which is fixed
//! at `exec` — it *does* change under a running process (a kubelet re-syncs it
//! about once a minute). Reading it is this adapter's job; the comparison lives
//! in `ev_lib::settings::drift`.
//!
//! Detect and alert only. Applying a change means a redeploy, so that what is
//! running keeps matching the gitops commit that describes it.

use std::{convert::Infallible, fs, path::PathBuf, time::Duration};

use ev_lib::settings::drift::Watcher;

/// Where the deployment mounts the Secret, one file per key. Unset ⇒ the watch
/// is off, which is the local and CI case.
const MOUNT_VAR: &str = "SETTINGS_DRIFT_MOUNT";

/// The house cadence. A kubelet's own Secret sync is about a minute, so
/// anything faster only adds log volume.
const INTERVAL: Duration = Duration::from_secs(300);

/// Watch for as long as the process lives. Idles forever when
/// `SETTINGS_DRIFT_MOUNT` is unset or does not exist, so the same binary runs
/// unchanged on a laptop.
pub async fn watch(vars: Vec<String>) -> Infallible {
	let Some(dir) = std::env::var(MOUNT_VAR).ok().filter(|dir| !dir.is_empty()).map(PathBuf::from) else {
		return std::future::pending().await;
	};
	if !dir.is_dir() {
		tracing::warn!(mount = %dir.display(), "{MOUNT_VAR} does not point at a directory — config drift watch is off");
		return std::future::pending().await;
	}

	let watcher = Watcher::new(vars, &mut reader(dir.clone()));
	let mut ticks = tokio::time::interval(INTERVAL);
	ticks.tick().await; // the first tick is immediate, and we just took the baseline
	loop {
		ticks.tick().await;
		for change in watcher.poll(&mut reader(dir.clone())) {
			// The change carries a variable name and a verb, never a value.
			tracing::warn!(%change, "settings drifted from the mounted secret — redeploy to apply");
		}
	}
}
fn reader(dir: PathBuf) -> impl FnMut(&str) -> Option<String> {
	move |var| fs::read_to_string(dir.join(var)).ok().map(|value| value.trim_end_matches('\n').to_string())
}
