import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ContactCTA() {
  return (
    <section className="section section--tight contact-cta">
      <div className="section__container contact-cta__inner">
        <div>
          <h2 className="section__heading">Have a project in mind?</h2>
          <p className="section__subheading">
            Always open to discussing new ideas and opportunities.
          </p>
        </div>
        <Link href="/contact" className="btn btn--primary">
          Start a Conversation
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
