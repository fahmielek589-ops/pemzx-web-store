"use client";

import { useState, FormEvent, useEffect } from "react";
import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { StyledInput } from "@/components/ui/input";
import { StyledTextarea } from "@/components/ui/textarea";
import { StyledSelect, Toggle } from "@/components/ui/select-toggle";
import { useToast } from "@/components/admin/toast";

interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  imageUrl: string;
  category: string;
  stock: string;
  isDigital: boolean;
  status: "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK";
  featured: boolean;
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  imageUrl: "",
  category: "General",
  stock: "0",
  isDigital: false,
  status: "DRAFT",
  featured: false,
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialValues?: (Partial<ProductFormValues> & { id: string; price: number; comparePrice: number | null; stock: number }) | null;
}

type Tab = "GENERAL" | "MEDIA" | "PRICING" | "INVENTORY" | "PUBLISHING";
const TABS: Tab[] = ["GENERAL", "MEDIA", "PRICING", "INVENTORY", "PUBLISHING"];

export function ProductFormModal({ open, onClose, onSaved, initialValues }: ProductFormModalProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("GENERAL");
  const [values, setValues] = useState<ProductFormValues>(EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setValues({
          name: initialValues.name ?? "",
          slug: initialValues.slug ?? "",
          description: initialValues.description ?? "",
          price: String(initialValues.price ?? ""),
          comparePrice: initialValues.comparePrice ? String(initialValues.comparePrice) : "",
          imageUrl: initialValues.imageUrl ?? "",
          category: initialValues.category ?? "General",
          stock: String(initialValues.stock ?? 0),
          isDigital: initialValues.isDigital ?? false,
          status: initialValues.status ?? "DRAFT",
          featured: initialValues.featured ?? false,
        });
        setSlugTouched(true);
      } else {
        setValues(EMPTY_VALUES);
        setSlugTouched(false);
      }
      setErrors({});
      setTab("GENERAL");
    }
  }, [open, initialValues]);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) {
      update("slug", slugify(name));
    }
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Upload failed.", "error");
        return;
      }
      update("imageUrl", data.url);
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setUploadingImage(false);
    }
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!values.name.trim()) newErrors.name = "Product name is required.";
    if (!values.slug.trim()) newErrors.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      newErrors.slug = "Slug must be lowercase letters, numbers and hyphens only.";
    }
    if (!values.description.trim()) newErrors.description = "Description is required.";
    if (values.price === "" || Number(values.price) < 0) {
      newErrors.price = "Enter a valid price.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) {
      // Jump to whichever tab holds the first error.
      if (errors.name || errors.slug || errors.description) setTab("GENERAL");
      else if (errors.price) setTab("PRICING");
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(initialValues?.id);
      const url = isEdit ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products";
      const payload = {
        ...values,
        price: Number(values.price),
        comparePrice: values.comparePrice ? Number(values.comparePrice) : null,
        stock: Number(values.stock),
      };
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Something went wrong.", "error");
        setSaving(false);
        return;
      }

      showToast(isEdit ? "Changes saved." : "Product created successfully.");
      onSaved();
      onClose();
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit Product" : "Add Product"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            {initialValues ? "Save Changes" : "Add Product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="form-tabs">
        <div className="form-tabs__nav">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`form-tabs__tab ${tab === t ? "form-tabs__tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {tab === "GENERAL" && (
          <div className="form-tabs__panel">
            <StyledInput
              label="Product Name"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={errors.name}
              required
            />
            <StyledInput
              label="Slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              error={errors.slug}
              required
            />
            <StyledTextarea
              label="Description"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              error={errors.description}
              rows={4}
              required
            />
            <StyledInput
              label="Category"
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>
        )}

        {tab === "MEDIA" && (
          <div className="form-tabs__panel">
            <StyledInput
              label="Image URL"
              placeholder="https://… (or upload below)"
              value={values.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
            />
            <div className="field">
              <label className="field__label">Upload Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              {uploadingImage && <p className="field__hint">Uploading…</p>}
            </div>
          </div>
        )}

        {tab === "PRICING" && (
          <div className="form-tabs__panel">
            <StyledInput
              label="Price (IDR)"
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
              error={errors.price}
              required
            />
            <StyledInput
              label="Compare Price (IDR, optional)"
              type="number"
              min={0}
              value={values.comparePrice}
              onChange={(e) => update("comparePrice", e.target.value)}
            />
          </div>
        )}

        {tab === "INVENTORY" && (
          <div className="form-tabs__panel">
            <StyledInput
              label="Stock"
              type="number"
              min={0}
              value={values.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
            <Toggle
              checked={values.isDigital}
              onChange={(v) => update("isDigital", v)}
              label="This is a digital product"
            />
          </div>
        )}

        {tab === "PUBLISHING" && (
          <div className="form-tabs__panel">
            <StyledSelect
              label="Status"
              value={values.status}
              onChange={(e) => update("status", e.target.value as ProductFormValues["status"])}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
                { value: "OUT_OF_STOCK", label: "Out of Stock" },
              ]}
            />
            <Toggle
              checked={values.featured}
              onChange={(v) => update("featured", v)}
              label="Feature this product"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
