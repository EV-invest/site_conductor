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

export const nameField = z
  .string()
  .trim()
  .refine(v => charLength(v) >= 2, "Name must be at least 2 characters.")
  .refine(
    v => charLength(v) <= LIMITS.name,
    `Name must be ${LIMITS.name} characters or fewer.`
  )
  .refine(
    v => /^[\p{Alphabetic} .'-]*$/u.test(v),
    "Use letters, spaces, and . ' - only."
  )
  .refine(
    v => (v.match(/\p{Alphabetic}/gu) ?? []).length >= 2,
    "Name must contain at least 2 letters."
  );

export const emailField = z
  .string()
  .trim()
  .pipe(
    z
      .email("Enter a valid email address.")
      .max(LIMITS.email, `Email must be ${LIMITS.email} characters or fewer.`)
  );

export const messageField = z
  .string()
  .trim()
  .refine(v => v.length > 0, "Please write a message.")
  .refine(
    v => charLength(v) <= LIMITS.message,
    `Message must be ${LIMITS.message} characters or fewer.`
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
