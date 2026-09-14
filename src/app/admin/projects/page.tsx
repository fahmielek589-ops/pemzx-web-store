"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { SearchBar, StatusFilter } from "@/components/admin/search-bar";
import { ProjectCard } from "@/components/admin/project-card";
import { ProjectFormModal } from "@/components/admin/project-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { SkeletonGrid } from "@/components/admin/skeleton";
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

interface ProjectItem {
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

export default function AdminProjectsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [deleting, setDeleting] = useState<ProjectItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status });
    if (query) params.set("q", query);

    try {
      const res = await fetch(`/api/admin/projects?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
      } else {
        showToast(data.error ?? "Failed to load projects.", "error");
      }
    } catch {
      showToast("Failed to load projects.", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, query]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function openAddModal() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditModal(project: ProjectItem) {
    setEditing(project);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to delete project.", "error");
        return;
      }
      showToast("Project deleted.");
      setDeleting(null);
      fetchProjects();
    } catch {
      showToast("Failed to delete project.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <AdminHeader
        title="Project Management"
        subtitle="Manage the featured projects shown on your portfolio."
        actions={
          <Button onClick={openAddModal}>
            <Plus size={16} />
            Add Project
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBar placeholder="Search projects…" onSearch={setQuery} />
        <StatusFilter
          value={status}
          onChange={setStatus}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
          ]}
        />
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : items.length === 0 ? (
        query || status !== "ALL" ? (
          <EmptyState icon={FolderKanban} title="No projects match your filters." />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet."
            actionLabel="Add Project"
            onAction={openAddModal}
          />
        )
      ) : (
        <div className="content-grid">
          {items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => openEditModal(project)}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProjects}
        initialValues={editing}
      />

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemLabel="project"
        loading={deleteLoading}
      />
    </div>
  );
}
