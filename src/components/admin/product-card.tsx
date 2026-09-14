import { Pencil, Trash2, Star } from "lucide-react";
import { StatusBadge, statusToVariant } from "@/components/admin/status-badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice: number | null;
    imageUrl: string | null;
    category: string;
    stock: number;
    status: string;
    featured: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cents);
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="content-card">
      <div className="content-card__thumb">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" />
        ) : (
          <div className="content-card__thumb-placeholder" />
        )}
        {product.featured && (
          <span className="content-card__featured-pin">
            <Star size={12} fill="currentColor" />
          </span>
        )}
      </div>
      <div className="content-card__body">
        <div className="content-card__badges">
          <StatusBadge variant={statusToVariant(product.status)} />
          <span className="content-card__category">{product.category}</span>
        </div>
        <h3 className="content-card__title">{product.name}</h3>
        <p className="content-card__description">{product.description}</p>
        <div className="content-card__price">
          {formatPrice(product.price)}
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="content-card__price-compare">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        <div className="content-card__meta">
          <span>{product.stock} in stock</span>
        </div>
      </div>
      <div className="content-card__actions">
        <button className="icon-btn" onClick={onEdit} aria-label="Edit product">
          <Pencil size={15} />
        </button>
        <button
          className="icon-btn icon-btn--danger"
          onClick={onDelete}
          aria-label="Delete product"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
