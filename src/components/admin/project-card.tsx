import { Pencil, Trash2, Star, Github, ExternalLink } from "lucide-react";
import { StatusBadge, statusToVariant } from "@/components/admin/status-badge";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    technologies: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    status: string;
    featured: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="content-card">
      <div className="content-card__thumb">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.imageUrl} alt="" />
        ) : (
          <div className="content-card__thumb-placeholder" />
        )}
        {project.featured && (
          <span className="content-card__featured-pin">
            <Star size={12} fill="currentColor" />
          </span>
        )}
      </div>
      <div className="content-card__body">
        <div className="content-card__badges">
          <StatusBadge variant={statusToVariant(project.status)} />
        </div>
        <h3 className="content-card__title">{project.title}</h3>
        <p className="content-card__description">{project.description}</p>
        {project.technologies.length > 0 && (
          <div className="content-card__tech-list">
            {project.technologies.slice(0, 4).map((tech) => (
              <span key={tech} className="content-card__tech-pill">
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="content-card__meta">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github size={13} />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
      <div className="content-card__actions">
        <button className="icon-btn" onClick={onEdit} aria-label="Edit project">
          <Pencil size={15} />
        </button>
        <button
          className="icon-btn icon-btn--danger"
          onClick={onDelete}
          aria-label="Delete project"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
