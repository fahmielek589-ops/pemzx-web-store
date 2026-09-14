type BadgeVariant = "published" | "draft" | "out-of-stock" | "featured" | "unread" | "read" | "archived";

const LABELS: Record<BadgeVariant, string> = {
  published: "Published",
  draft: "Draft",
  "out-of-stock": "Out of Stock",
  featured: "Featured",
  unread: "Unread",
  read: "Read",
  archived: "Archived",
};

export function StatusBadge({ variant }: { variant: BadgeVariant }) {
  return <span className={`status-badge status-badge--${variant}`}>{LABELS[variant]}</span>;
}

export function statusToVariant(status: string): BadgeVariant {
  switch (status) {
    case "PUBLISHED":
      return "published";
    case "OUT_OF_STOCK":
      return "out-of-stock";
    case "UNREAD":
      return "unread";
    case "READ":
      return "read";
    case "ARCHIVED":
      return "archived";
    default:
      return "draft";
  }
}
