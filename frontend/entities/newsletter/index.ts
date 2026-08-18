/** Why a subscribe attempt failed. The UI translates these; the entity must
 * not return prose, or the footer would answer a /ru/ reader in English. */
export type SubscribeError = "duplicate" | "server" | "network";

export type SubscribeResult =
  | { ok: true; id: string }
  | { ok: false; error: SubscribeError };

/** POST /api/v1/newsletter — subscribe an email to the newsletter. */
export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  try {
    const res = await fetch("/api/v1/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status === 409) {
      return { ok: false, error: "duplicate" };
    }
    if (!res.ok) {
      return { ok: false, error: "server" };
    }
    const body = (await res.json()) as { id: string };
    return { ok: true, id: body.id };
  } catch {
    return { ok: false, error: "network" };
  }
}
