import { Github, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { VideoPlayerCard } from "@/components/home/video-player-card";
import "@/components/home/section-shell.css";
import "@/components/home/video-player-card.css";
import "./projects.css";

export const metadata = {
  title: "Projects — PEMZX",
  description: "A collection of projects built by Pemzx.",
};

export default async function ProjectsPage() {
  const [projects, videos] = await Promise.all([
    prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  return (
    <>
      <section className="section">
        <div className="section__container">
          <p className="section__eyebrow">Projects</p>
          <h1 className="section__heading">Things I&apos;ve built.</h1>
          <p className="section__subheading">
            A collection of full-stack builds, platform work, and interface
            experiments.
          </p>

          {projects.length === 0 ? (
            <p className="projects-empty">No projects published yet — check back soon.</p>
          ) : (
            <div className="projects-full-grid">
              {projects.map((project) => (
                <article key={project.id} className="project-full-card">
                  <div className="project-full-card__thumb">
                    {project.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.imageUrl} alt="" />
                    ) : (
                      <div className="project-full-card__thumb-placeholder" />
                    )}
                    {project.featured && (
                      <span className="project-full-card__featured-tag">Featured</span>
                    )}
                  </div>
                  <div className="project-full-card__body">
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="project-full-card__tech">
                        {project.technologies.map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-full-card__links">
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          Live Demo <ArrowUpRight size={14} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github size={14} /> Source
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {videos.length > 0 && (
        <>
          <div className="section-divider" />
          <section className="section">
            <div className="section__container">
              <p className="section__eyebrow">Showcase</p>
              <h2 className="section__heading">Video highlights</h2>
              <div className="video-showcase-grid">
                {videos.map((video) => (
                  <VideoPlayerCard
                    key={video.id}
                    title={video.title}
                    description={video.description}
                    videoUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    category={video.category}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
