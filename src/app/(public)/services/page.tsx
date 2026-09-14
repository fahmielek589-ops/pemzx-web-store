import { Code2, LayoutDashboard, Rocket, Wrench } from "lucide-react";
import "@/components/home/section-shell.css";
import "./services.css";

export const metadata = {
  title: "Services — PEMZX",
  description: "Development services offered by Pemzx.",
};

const SERVICES = [
  {
    icon: LayoutDashboard,
    title: "Web Application Development",
    description:
      "Full-stack web applications built with modern frameworks — from the interface down to the database.",
  },
  {
    icon: Code2,
    title: "Frontend Engineering",
    description:
      "Responsive, accessible interfaces with attention to performance and interaction detail.",
  },
  {
    icon: Rocket,
    title: "Platform & CMS Builds",
    description:
      "Admin dashboards, content management systems, and internal tools tailored to how a team actually works.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Optimization",
    description:
      "Improving existing codebases — performance, security, and long-term maintainability.",
  },
];

export default function ServicesPage() {
  return (
    <section className="section">
      <div className="section__container">
        <p className="section__eyebrow">Services</p>
        <h1 className="section__heading">What I can help with.</h1>
        <p className="section__subheading">
          Available for select projects — reach out to discuss scope and
          timeline.
        </p>

        <div className="services-grid">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="service-card">
                <div className="service-card__icon">
                  <Icon size={20} />
                </div>
                <h2 className="service-card__title">{service.title}</h2>
                <p className="service-card__description">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
