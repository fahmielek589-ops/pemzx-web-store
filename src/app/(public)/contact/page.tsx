import { Mail } from "lucide-react";
import { ContactForm } from "@/components/home/contact-form";
import "@/components/home/section-shell.css";
import "@/components/home/contact-form.css";
import "@/components/ui/input.css";
import "@/components/ui/button.css";
import "./contact.css";

export const metadata = {
  title: "Contact — PEMZX",
  description: "Get in touch with Pemzx.",
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="section__container contact-page">
        <div className="contact-page__intro">
          <p className="section__eyebrow">Contact</p>
          <h1 className="section__heading">Let&apos;s work together.</h1>
          <p className="section__subheading">
            Have a project, question, or just want to say hi? Send a message
            and I&apos;ll get back to you as soon as I can.
          </p>
          <div className="contact-page__detail">
            <Mail size={16} />
            <span>Response time: usually within 1–2 business days</span>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
