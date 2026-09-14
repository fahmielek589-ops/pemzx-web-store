"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { StyledInput } from "@/components/ui/input";
import { StyledTextarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormValues = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const newErrors: Partial<FormValues> = {};
    if (!values.name.trim()) newErrors.name = "Name is required.";
    if (!values.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!values.subject.trim()) newErrors.subject = "Subject is required.";
    if (!values.message.trim()) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setValues(EMPTY);
    } catch {
      setServerError("Unable to reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="contact-form__success">
        <CheckCircle2 size={32} />
        <h3>Message sent.</h3>
        <p>Thanks for reaching out — I&apos;ll get back to you soon.</p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      {serverError && (
        <div className="form-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="contact-form__row">
        <StyledInput
          label="Name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          required
        />
        <StyledInput
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          required
        />
      </div>

      <StyledInput
        label="Subject"
        value={values.subject}
        onChange={(e) => update("subject", e.target.value)}
        error={errors.subject}
        required
      />

      <StyledTextarea
        label="Message"
        rows={6}
        value={values.message}
        onChange={(e) => update("message", e.target.value)}
        error={errors.message}
        required
      />

      <Button type="submit" loading={submitting} className="contact-form__submit">
        Send Message
      </Button>
    </form>
  );
}
