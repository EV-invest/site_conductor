import { type FormEvent, useState } from "react";
import type { FieldErrors } from "@/shared/lib/validation";

/** Lifecycle of one submission, from untouched form to accepted payload. */
export type Status = "idle" | "sending" | "sent" | "error";

/** What a validator answers: the trimmed payload, or a message per bad field. */
type Validated<TFields> =
  | { data: TFields; errors?: never }
  | { data?: never; errors: FieldErrors<TFields> };

/**
 * A payload is there exactly when no field failed. TypeScript can't read that
 * off the union while the field map is still generic, so state it once here
 * rather than at the one place the payload is posted.
 */
const isPayload = <TFields>(
  result: Validated<TFields>
): result is { data: TFields; errors?: never } => !result.errors;

interface ValidatedFormOptions<TFields> {
  /** Field values before the first keystroke; read once, on mount. */
  initial: TFields;
  validate: (fields: TFields) => Validated<TFields>;
  /** Posts the validated payload; answers the client's `{ data, error }` pair. */
  send: (data: TFields) => Promise<{ data?: unknown; error?: unknown }>;
}

/**
 * Text-field state and the validated submit both site forms run on. The caller
 * owns what a payload is (`validate`) and where it goes (`send`); the harness
 * owns the rest — clearing a field's error as it's edited, the
 * idle/sending/sent/error transitions, and the failure keys.
 */
export function useValidatedForm<TFields extends Record<string, string>>({
  initial,
  validate,
  send,
}: ValidatedFormOptions<TFields>) {
  const [fields, setFields] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<TFields>>({});
  const [status, setStatus] = useState<Status>("idle");
  // A key, not a sentence: the backend answers in English, so a submit failure
  // is reported through the catalogue instead of relayed verbatim. The precise
  // cases are already covered by the inline per-field errors.
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const edit = (field: keyof TFields & string) => (value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus(prev => (prev === "error" ? "idle" : prev));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = validate(fields);
    if (!isPayload(result)) {
      setErrors(result.errors);
      return;
    }
    setStatus("sending");
    try {
      const { data, error } = await send(result.data);
      if (error || !data) {
        setErrorKey("form.submitError");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorKey("form.networkError");
      setStatus("error");
    }
  }

  return { fields, edit, errors, status, errorKey, submit };
}
