import { z } from "zod";

// Limits mirror the backend contract (backend/openapi.json, issue #125);
// change them together or the form and the API drift apart.
export const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  portfolioUrl: 2048,
  screeningAnswer: 5000,
} as const;

/** Code-point count — the backend counts chars, not UTF-16 units. */
export const charLength = (value: string) => [...value].length;

// The refinement "messages" are catalogue keys, not prose. A zod message is
// produced where no translator exists (module scope, shared by two forms) and
// read where one does, so the form looks the key up at render — see the `fe`
// helper in each form. The max-length keys interpolate `LIMITS`, which is
// passed as the value bag, so a limit change moves the copy with it.
export const nameField = z
  .string()
  .trim()
  .refine(v => charLength(v) >= 2, "validation.name.min")
  .refine(
    v => charLength(v) <= LIMITS.name,
    "validation.name.max"
  )
  .refine(
    v => /^[\p{Alphabetic} .'-]*$/u.test(v),
    "validation.name.charset"
  )
  .refine(
    v => (v.match(/\p{Alphabetic}/gu) ?? []).length >= 2,
    "validation.name.letters"
  );

export const emailField = z
  .string()
  .trim()
  .pipe(
    z
      .email("validation.email.invalid")
      .max(LIMITS.email, "validation.email.max")
  );

export const messageField = z
  .string()
  .trim()
  .refine(v => v.length > 0, "validation.message.required")
  .refine(
    v => charLength(v) <= LIMITS.message,
    "validation.message.max"
  );

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/** First issue per field — the message an inline form error displays. */
export function firstFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const fields = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const first: FieldErrors<T> = {};
  for (const [field, messages] of Object.entries(fields)) {
    if (messages?.[0]) first[field as keyof T & string] = messages[0];
  }
  return first;
}
