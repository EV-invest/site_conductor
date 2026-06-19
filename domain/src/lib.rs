#![feature(default_field_values)]
pub mod error;
pub mod model;

/// Re-export of the `architecture` feature of the external `ev` crate — the
/// shared DDD tactical building blocks — so consumers reach them via
/// `domain::architecture::…` without depending on `ev` directly.
pub use ev::architecture;
