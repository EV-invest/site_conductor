import { type FormEvent, useState } from "react";
import { createContact } from "@/entities/contact";
import { type ContactErrors, validateContact } from "../model/validation";

export type Status = "idle" | "sending" | "sent" | "error";

/** State + zod-validated submit for the contact form. */
export function useContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  // A key, not a sentence: the backend answers in English, so a submit failure
  // is reported through the catalogue instead of relayed verbatim. The precise
  // cases are already covered by the inline per-field errors.
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const edit = (field: keyof typeof fields) => (value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus(prev => (prev === "error" ? "idle" : prev));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateContact(fields);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setStatus("sending");
    try {
      const { data, error } = await createContact({ body: result.data });
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
