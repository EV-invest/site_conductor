//! Use cases. Each service depends only on driven-side ports (trait objects),
//! never on a concrete adapter — so they are unit-testable with in-memory fakes
//! and unaware of Postgres or SMTP.

pub mod application_service;
pub mod contact_service;
pub mod vacancy_service;
