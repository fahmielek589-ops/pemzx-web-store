import { Hero } from "@/components/home/hero";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { ContactCTA } from "@/components/home/contact-cta";
import "@/components/home/hero.css";
import "@/components/home/section-shell.css";
import "@/components/home/featured-projects.css";
import "@/components/home/contact-cta.css";
import "@/components/ui/button.css";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="section-divider" />
      <FeaturedProjects />
      <ContactCTA />
    </>
  );
}
