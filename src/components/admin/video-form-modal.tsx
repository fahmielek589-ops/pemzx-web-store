"use client";

import { useState, FormEvent, useEffect } from "react";
import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { StyledInput } from "@/components/ui/input";
import { StyledTextarea } from "@/components/ui/textarea";
import { StyledSelect, Toggle } from "@/components/ui/select-toggle";
import { useToast } from "@/components/admin/toast";

interface VideoFormValues {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
}

const EMPTY_VALUES: VideoFormValues = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "General",
  status: "DRAFT",
  featured: false,
};

interface VideoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialValues?: (Omit<VideoFormValues, "thumbnailUrl"> & { id: string; thumbnailUrl: string | null }) | null;
}
type Tab = "GENERAL" | "MEDIA" | "PUBLISHING";

export function VideoFormModal({ open, onClose, onSaved, initialValues }: VideoFormModalProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("GENERAL");
  const [values, setValues] = useState<VideoFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof VideoFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        initialValues
          ? {
              title: initialValues.title,
              description: initialValues.description,
              videoUrl: initialValues.videoUrl,
              thumbnailUrl: initialValues.thumbnailUrl ?? "",
              category: initialValues.category,
              status: initialValues.status,
              featured: initialValues.featured,
            }
          : EMPTY_VALUES
      );
      setErrors({});
      setTab("GENERAL");
    }
  }, [open, initialValues]);

  function update<K extends keyof VideoFormValues>(key: K, value: VideoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!values.title.trim()) newErrors.title = "Title is required.";
    if (!values.description.trim()) newErrors.description = "Description is required.";
    if (!values.videoUrl.trim()) newErrors.videoUrl = "Video URL is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleThumbnailUpload(file: File) {
    setUploadingThumb(true);
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
      update("thumbnailUrl", data.url);
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setUploadingThumb(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setTab("GENERAL");
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(initialValues?.id);
      const url = isEdit ? `/api/admin/videos/${initialValues!.id}` : "/api/admin/videos";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Something went wrong.", "error");
        setSaving(false);
        return;
      }

      showToast(isEdit ? "Changes saved." : "Video published successfully.");
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
      title={initialValues ? "Edit Video" : "Add Video"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="video-form" loading={saving}>
            {initialValues ? "Save Changes" : "Add Video"}
          </Button>
        </>
      }
    >
      <form id="video-form" onSubmit={handleSubmit} className="form-tabs">
        <div className="form-tabs__nav">
          {(["GENERAL", "MEDIA", "PUBLISHING"] as Tab[]).map((t) => (
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
              label="Video Title"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              error={errors.title}
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
              label="Video URL"
              placeholder="https://…"
              value={values.videoUrl}
              onChange={(e) => update("videoUrl", e.target.value)}
              error={errors.videoUrl}
              required
            />
            <StyledInput
              label="Thumbnail URL"
              placeholder="https://… (or upload below)"
              value={values.thumbnailUrl}
              onChange={(e) => update("thumbnailUrl", e.target.value)}
            />
            <div className="field">
              <label className="field__label">Upload Thumbnail</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploadingThumb}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
              />
              {uploadingThumb && <p className="field__hint">Uploading…</p>}
            </div>
          </div>
        )}

        {tab === "PUBLISHING" && (
          <div className="form-tabs__panel">
            <StyledSelect
              label="Status"
              value={values.status}
              onChange={(e) => update("status", e.target.value as "DRAFT" | "PUBLISHED")}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
              ]}
            />
            <Toggle
              checked={values.featured}
              onChange={(v) => update("featured", v)}
              label="Feature this video"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
