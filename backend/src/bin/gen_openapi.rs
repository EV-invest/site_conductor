//! Dump the OpenAPI document to stdout. `nix run .#gen-api` pipes this into
//! `backend/openapi.json`, which feeds the frontend's generated TS client.

use backend::api::openapi::ApiDoc;
use utoipa::OpenApi;

fn main() {
	println!("{}", ApiDoc::openapi().to_pretty_json().expect("failed to serialise the OpenAPI document"));
}
