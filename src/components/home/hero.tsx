import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <p className="hero__eyebrow">Developer Portfolio</p>
        <h1 className="hero__headline">
          Pemzx builds fast,
          <br />
          precise digital products.
        </h1>
        <p className="hero__lede">
          A developer focused on modern, responsive and high-performance
          digital experiences — from concept through to production.
        </p>
        <div className="hero__actions">
          <Link href="/projects" className="btn btn--primary">
            View Projects
          </Link>
          <Link href="/contact" className="hero__secondary-link">
            Get in touch
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="hero__glow" aria-hidden="true" />
    </section>
  );
}
