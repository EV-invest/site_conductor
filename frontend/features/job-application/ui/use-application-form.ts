import { type FormEvent, useState } from "react";
import { createApplication } from "@/entities/job-application";
import {
  type ApplicationErrors,
  validateApplication,
} from "../model/validation";

export interface VacancyContext {
  slug: string;
  title: string;
  requirements: string[];
  screeningQuestion: string;
}

export type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = {
  name: "",
  email: "",
  portfolio: "",
  message: "",
  screening: "",
};

/** State + zod-validated submit for the application form. */
export function useApplicationForm(vacancy?: VacancyContext) {
  const [fields, setFields] = useState(EMPTY);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  // A key, not a sentence — see the note in the contact form's hook.
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const edit = (field: keyof typeof EMPTY) => (value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus(prev => (prev === "error" ? "idle" : prev));
  };

  const toggle = (requirement: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(requirement)) next.delete(requirement);
      else next.add(requirement);
      return next;
    });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateApplication(fields);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setStatus("sending");
    const { name, email, portfolio, message, screening } = result.data;
    try {
      const { data, error } = await createApplication({
        body: {
          vacancy_slug: vacancy?.slug,
          name,
          email,
          portfolio_url: portfolio || undefined,
          message,
          confirmed_requirements: vacancy ? [...checked] : [],
          screening_answer: vacancy && screening ? screening : undefined,
        },
      });
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

  return { fields, edit, checked, toggle, errors, status, errorKey, submit };
}
