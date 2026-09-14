"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { SearchBar, StatusFilter } from "@/components/admin/search-bar";
import { ProductCard } from "@/components/admin/product-card";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { SkeletonGrid } from "@/components/admin/skeleton";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";
import "@/components/admin/admin-header.css";
import "@/components/admin/admin-common.css";
import "@/components/admin/content-card.css";
import "@/components/admin/admin-states.css";
import "@/components/admin/form-tabs.css";
import "@/components/admin/modal.css";
import "@/components/ui/input.css";
import "@/components/ui/select-toggle.css";
import "@/components/ui/button.css";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  category: string;
  stock: number;
  isDigital: boolean;
  status: string;
  featured: boolean;
}

const PAGE_SIZE = 12;

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState<ProductItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      status,
    });
    if (query) params.set("q", query);

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        setTotal(data.total);
      } else {
        showToast(data.error ?? "Failed to load products.", "error");
      }
    } catch {
      showToast("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(q: string) {
    setQuery(q);
    setPage(1);
  }

  function handleStatusChange(s: string) {
    setStatus(s);
    setPage(1);
  }

  function openAddModal() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditModal(product: ProductItem) {
    setEditing(product);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to delete product.", "error");
        return;
      }
      showToast("Product deleted.");
      setDeleting(null);
      fetchProducts();
    } catch {
      showToast("Failed to delete product.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <AdminHeader
        title="Product Management"
        subtitle="Create and manage the products shown on your portfolio."
        actions={
          <Button onClick={openAddModal}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBar placeholder="Search products…" onSearch={handleSearch} />
        <StatusFilter
          value={status}
          onChange={handleStatusChange}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
            { value: "OUT_OF_STOCK", label: "Out of Stock" },
          ]}
        />
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : items.length === 0 ? (
        query || status !== "ALL" ? (
          <EmptyState icon={ShoppingBag} title="No products match your filters." />
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="No products yet."
            actionLabel="Add Product"
            onAction={openAddModal}
          />
        )
      ) : (
        <>
          <div className="content-grid">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => openEditModal(product)}
                onDelete={() => setDeleting(product)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
        initialValues={editing}
      />

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemLabel="product"
        loading={deleteLoading}
      />
    </div>
  );
}
