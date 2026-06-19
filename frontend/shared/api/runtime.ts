import type { CreateClientConfig } from "./generated/client.gen";

// Runtime config for the generated fetch client. Kept separate from the
// generated artifact so codegen never overwrites our base URL / headers.
// The backend's OpenAPI paths already include `/api/v1`, so baseUrl is just
// the origin. Override per environment via NEXT_PUBLIC_API_URL.
export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
});
