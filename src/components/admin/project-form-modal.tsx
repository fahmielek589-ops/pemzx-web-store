"use client";

import { useState, FormEvent, useEffect } from "react";
import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";
import { StyledInput } from "@/components/ui/input";
import { StyledTextarea } from "@/components/ui/textarea";
import { StyledSelect, Toggle } from "@/components/ui/select-toggle";
import { useToast } from "@/components/admin/toast";

interface ProjectFormValues {
  title: string;
  description: string;
  imageUrl: string;
  technologiesText: string; // comma-separated in the UI, split on submit
  githubUrl: string;
  liveUrl: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
}

const EMPTY_VALUES: ProjectFormValues = {
  title: "",
  description: "",
  imageUrl: "",
  technologiesText: "",
  githubUrl: "",
  liveUrl: "",
  status: "DRAFT",
  featured: false,
};

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialValues?:
    | {
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
        technologies: string[];
        githubUrl: string | null;
        liveUrl: string | null;
        status: string;
        featured: boolean;
      }
    | null;
}

type Tab = "GENERAL" | "MEDIA" | "PUBLISHING";

export function ProjectFormModal({ open, onClose, onSaved, initialValues }: ProjectFormModalProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("GENERAL");
  const [values, setValues] = useState<ProjectFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setValues({
          title: initialValues.title,
          description: initialValues.description,
          imageUrl: initialValues.imageUrl ?? "",
          technologiesText: initialValues.technologies.join(", "),
          githubUrl: initialValues.githubUrl ?? "",
          liveUrl: initialValues.liveUrl ?? "",
          status: initialValues.status as "DRAFT" | "PUBLISHED",
          featured: initialValues.featured,
        });
      } else {
        setValues(EMPTY_VALUES);
      }
      setErrors({});
      setTab("GENERAL");
    }
  }, [open, initialValues]);

  function update<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
    if (!values.title.trim()) newErrors.title = "Title is required.";
    if (!values.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const url = isEdit ? `/api/admin/projects/${initialValues!.id}` : "/api/admin/projects";
      const payload = {
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        technologies: values.technologiesText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        githubUrl: values.githubUrl,
        liveUrl: values.liveUrl,
        status: values.status,
        featured: values.featured,
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

      showToast(isEdit ? "Changes saved." : "Project added successfully.");
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
      title={initialValues ? "Edit Project" : "Add Project"}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" loading={saving}>
            {initialValues ? "Save Changes" : "Add Project"}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="form-tabs">
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
              label="Title"
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
              label="Technologies"
              placeholder="Next.js, TypeScript, Prisma"
              value={values.technologiesText}
              onChange={(e) => update("technologiesText", e.target.value)}
            />
            <StyledInput
              label="GitHub URL"
              placeholder="https://github.com/…"
              value={values.githubUrl}
              onChange={(e) => update("githubUrl", e.target.value)}
            />
            <StyledInput
              label="Live URL"
              placeholder="https://…"
              value={values.liveUrl}
              onChange={(e) => update("liveUrl", e.target.value)}
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
              label="Feature this project"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
