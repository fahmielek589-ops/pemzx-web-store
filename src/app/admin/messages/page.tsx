"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Archive, Trash2, Mail, MailOpen } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusFilter } from "@/components/admin/search-bar";
import { StatusBadge, statusToVariant } from "@/components/admin/status-badge";
import { Modal } from "@/components/admin/modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";
import "@/components/admin/admin-header.css";
import "@/components/admin/admin-common.css";
import "@/components/admin/admin-states.css";
import "@/components/admin/modal.css";
import "@/components/ui/button.css";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<MessageItem[]>([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const [deleting, setDeleting] = useState<MessageItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status });
    try {
      const res = await fetch(`/api/admin/messages?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
      } else {
        showToast(data.error ?? "Failed to load messages.", "error");
      }
    } catch {
      showToast("Failed to load messages.", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function updateStatus(message: MessageItem, newStatus: MessageItem["status"]) {
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to update message.", "error");
        return;
      }
      fetchMessages();
      if (selected?.id === message.id) {
        setSelected({ ...message, status: newStatus });
      }
    } catch {
      showToast("Failed to update message.", "error");
    }
  }

  function openMessage(message: MessageItem) {
    setSelected(message);
    if (message.status === "UNREAD") {
      updateStatus(message, "READ");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/messages/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to delete message.", "error");
        return;
      }
      showToast("Message deleted.");
      setDeleting(null);
      setSelected(null);
      fetchMessages();
    } catch {
      showToast("Failed to delete message.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <AdminHeader title="Messages" subtitle="Messages submitted through your contact form." />

      <div className="admin-toolbar">
        <StatusFilter
          value={status}
          onChange={setStatus}
          options={[
            { value: "ALL", label: "All messages" },
            { value: "UNREAD", label: "Unread" },
            { value: "READ", label: "Read" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
      </div>

      {loading ? (
        <p className="admin-loading-text">Loading messages…</p>
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((message) => (
                <tr
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className="admin-table__row-clickable"
                >
                  <td>{message.status === "UNREAD" ? <Mail size={15} /> : <MailOpen size={15} />}</td>
                  <td>
                    <div>{message.name}</div>
                    <div className="admin-table__subtext">{message.email}</div>
                  </td>
                  <td>{message.subject}</td>
                  <td>
                    <StatusBadge variant={statusToVariant(message.status)} />
                  </td>
                  <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table__actions" onClick={(e) => e.stopPropagation()}>
                      {message.status !== "ARCHIVED" && (
                        <button
                          className="icon-btn"
                          onClick={() => updateStatus(message, "ARCHIVED")}
                          aria-label="Archive message"
                        >
                          <Archive size={15} />
                        </button>
                      )}
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() => setDeleting(message)}
                        aria-label="Delete message"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          title={selected.subject}
          footer={
            <>
              {selected.status !== "ARCHIVED" && (
                <Button
                  variant="secondary"
                  onClick={() => updateStatus(selected, "ARCHIVED")}
                >
                  Archive
                </Button>
              )}
              <Button variant="destructive" onClick={() => setDeleting(selected)}>
                Delete
              </Button>
            </>
          }
        >
          <div className="message-detail">
            <div className="message-detail__meta">
              From <strong>{selected.name}</strong> ({selected.email}) ·{" "}
              {new Date(selected.createdAt).toLocaleString()}
            </div>
            <p className="message-detail__body">{selected.message}</p>
          </div>
        </Modal>
      )}

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemLabel="message"
        loading={deleteLoading}
      />
    </div>
  );
}
