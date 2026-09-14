import "@/components/home/section-shell.css";
import "./about.css";

export const metadata = {
  title: "About — PEMZX",
  description:
    "Pemzx is a developer focused on building modern, responsive and high-performance digital experiences.",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="section__container">
        <p className="section__eyebrow">About</p>
        <h1 className="section__heading">Building with intent.</h1>
        <div className="about-page__body">
          <p>
            Pemzx is a developer focused on modern, responsive and
            high-performance digital experiences. The work spans full-stack
            product builds — from interface design through to the systems
            running underneath.
          </p>
          <p>
            The approach favors clarity over cleverness: clean architecture,
            deliberate design decisions, and interfaces that feel considered
            rather than assembled. Every project starts with understanding
            the problem before writing a single line of code.
          </p>
          <p>
            Currently taking on select projects — product builds, platform
            work, and everything in between.
          </p>
        </div>
      </div>
    </section>
  );
}
