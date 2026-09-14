"use client";

import { useCallback, useEffect, useState } from "react";
import { Film, Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { SearchBar, StatusFilter } from "@/components/admin/search-bar";
import { VideoCard } from "@/components/admin/video-card";
import { VideoFormModal } from "@/components/admin/video-form-modal";
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

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string;
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
}

const PAGE_SIZE = 12;

export default function AdminVideosPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<VideoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState<VideoItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      status,
    });
    if (query) params.set("q", query);

    try {
      const res = await fetch(`/api/admin/videos?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        setTotal(data.total);
      } else {
        showToast(data.error ?? "Failed to load videos.", "error");
      }
    } catch {
      showToast("Failed to load videos.", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, query]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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

  function openEditModal(video: VideoItem) {
    setEditing(video);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/videos/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to delete video.", "error");
        return;
      }
      showToast("Video deleted.");
      setDeleting(null);
      fetchVideos();
    } catch {
      showToast("Failed to delete video.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <AdminHeader
        title="Video Management"
        subtitle="Add, edit, and publish videos shown on your portfolio."
        actions={
          <Button onClick={openAddModal}>
            <Plus size={16} />
            Add Video
          </Button>
        }
      />

      <div className="admin-toolbar">
        <SearchBar placeholder="Search videos…" onSearch={handleSearch} />
        <StatusFilter
          value={status}
          onChange={handleStatusChange}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
          ]}
        />
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : items.length === 0 ? (
        query || status !== "ALL" ? (
          <EmptyState icon={Film} title="No videos match your filters." />
        ) : (
          <EmptyState
            icon={Film}
            title="Your video library is empty."
            actionLabel="Add Your First Video"
            onAction={openAddModal}
          />
        )
      ) : (
        <>
          <div className="content-grid">
            {items.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={() => openEditModal(video)}
                onDelete={() => setDeleting(video)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <VideoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchVideos}
        initialValues={editing}
      />

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemLabel="video"
        loading={deleteLoading}
      />
    </div>
  );
}
