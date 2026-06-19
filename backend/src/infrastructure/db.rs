use sqlx::{PgPool, postgres::PgPoolOptions};

pub async fn connect(database_url: &str) -> anyhow::Result<PgPool> {
	let pool = PgPoolOptions::new().max_connections(10).connect(database_url).await?;
	Ok(pool)
}

/// Run pending migrations at startup. The macro embeds `backend/migrations`
/// into the binary, so deployment carries its own schema.
pub async fn migrate(pool: &PgPool) -> anyhow::Result<()> {
	sqlx::migrate!("./migrations").run(pool).await?;
	Ok(())
}
