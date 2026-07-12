import { type FormEvent, useState } from "react";
import { createContact } from "@/entities/contact";
import { extractApiError } from "@/shared/api";
import { type ContactErrors, validateContact } from "../model/validation";

export type Status = "idle" | "sending" | "sent" | "error";

/** State + zod-validated submit for the contact form. */
export function useContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const edit = (field: keyof typeof fields) => (value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
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
        setErrorMsg(extractApiError(error));
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  return { fields, edit, errors, status, errorMsg, submit };
}
