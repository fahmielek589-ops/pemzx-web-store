import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { prisma } from "@/lib/db";

export async function FeaturedProjects() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (projects.length === 0) return null;

  return (
    <section className="section">
      <div className="section__container">
        <p className="section__eyebrow">Featured Work</p>
        <h2 className="section__heading">Selected projects</h2>
        <p className="section__subheading">
          A few recent builds — see the full list on the Projects page.
        </p>

        <div className="project-preview-grid">
          {projects.map((project) => (
            <article key={project.id} className="project-preview-card">
              <div className="project-preview-card__thumb">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.imageUrl} alt="" />
                ) : (
                  <div className="project-preview-card__thumb-placeholder" />
                )}
              </div>
              <div className="project-preview-card__body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="project-preview-card__tech">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                )}
                <div className="project-preview-card__links">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Live <ArrowUpRight size={13} />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github size={13} /> Code
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <Link href="/projects" className="section__view-all">
          View all projects
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}
