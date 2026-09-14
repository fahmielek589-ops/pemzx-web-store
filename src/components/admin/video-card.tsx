import { Pencil, Trash2, Star } from "lucide-react";
import { StatusBadge, statusToVariant } from "@/components/admin/status-badge";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    status: string;
    featured: boolean;
    views: number;
    createdAt: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function VideoCard({ video, onEdit, onDelete }: VideoCardProps) {
  return (
    <div className="content-card">
      <div className="content-card__thumb">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" />
        ) : (
          <div className="content-card__thumb-placeholder" />
        )}
        {video.featured && (
          <span className="content-card__featured-pin">
            <Star size={12} fill="currentColor" />
          </span>
        )}
      </div>
      <div className="content-card__body">
        <div className="content-card__badges">
          <StatusBadge variant={statusToVariant(video.status)} />
          <span className="content-card__category">{video.category}</span>
        </div>
        <h3 className="content-card__title">{video.title}</h3>
        <p className="content-card__description">{video.description}</p>
        <div className="content-card__meta">
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          {video.views > 0 && <span>{video.views} views</span>}
        </div>
      </div>
      <div className="content-card__actions">
        <button className="icon-btn" onClick={onEdit} aria-label="Edit video">
          <Pencil size={15} />
        </button>
        <button
          className="icon-btn icon-btn--danger"
          onClick={onDelete}
          aria-label="Delete video"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
