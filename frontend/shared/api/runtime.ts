import { requiredInProd } from "@/shared/config/require-env";

import type { CreateClientConfig } from "./generated/client.gen";

// Runtime config for the generated fetch client. Kept separate from the
// generated artifact so codegen never overwrites our base URL / headers.
//
// Server Component fetches and browser fetches resolve the API origin
// differently: the server can reach the backend over an internal address
// (API_URL_INTERNAL, not NEXT_PUBLIC_) while the browser must use the public
// origin (NEXT_PUBLIC_API_URL). The backend's OpenAPI paths already include
// `/api/v1`, so the base URL is just the origin.
const PUBLIC_API_URL = requiredInProd(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL", "http://localhost:58844");
const SERVER_BASE_URL = process.env.API_URL_INTERNAL ?? PUBLIC_API_URL;
const BROWSER_BASE_URL = PUBLIC_API_URL;

export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  baseUrl: typeof window === "undefined" ? SERVER_BASE_URL : BROWSER_BASE_URL,
});
