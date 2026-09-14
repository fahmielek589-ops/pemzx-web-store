import "@/components/home/section-shell.css";
import "./skills.css";

export const metadata = {
  title: "Skills — PEMZX",
  description: "Technical skills and tools Pemzx works with.",
};

interface SkillGroup {
  category: string;
  items: string[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5 / CSS3"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Prisma", "PostgreSQL", "REST APIs", "Authentication & Security"],
  },
  {
    category: "Tools & Workflow",
    items: ["Git", "Docker", "CI/CD", "Vercel", "Figma"],
  },
  {
    category: "Practices",
    items: ["Responsive Design", "Accessibility", "Performance Optimization", "Testing"],
  },
];

export default function SkillsPage() {
  return (
    <section className="section">
      <div className="section__container">
        <p className="section__eyebrow">Skills</p>
        <h1 className="section__heading">Tools of the trade.</h1>
        <p className="section__subheading">
          A working toolkit built through hands-on project experience.
        </p>

        <div className="skills-grid">
          {SKILL_GROUPS.map((group) => (
            <div key={group.category} className="skills-group">
              <h2 className="skills-group__title">{group.category}</h2>
              <ul className="skills-group__list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
