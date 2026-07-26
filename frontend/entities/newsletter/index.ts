export type SubscribeResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** POST /api/v1/newsletter — subscribe an email to the newsletter. */
export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  try {
    const res = await fetch("/api/v1/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status === 409) {
      return { ok: false, error: "You're already on the list." };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: (body as { error?: string }).error ?? "Something went wrong — please try again." };
    }
    const body = (await res.json()) as { id: string };
    return { ok: true, id: body.id };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}
