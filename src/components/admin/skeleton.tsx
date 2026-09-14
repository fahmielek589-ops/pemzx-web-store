export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__thumb skeleton-shimmer" />
      <div className="skeleton-card__line skeleton-shimmer" style={{ width: "70%" }} />
      <div className="skeleton-card__line skeleton-shimmer" style={{ width: "40%" }} />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
