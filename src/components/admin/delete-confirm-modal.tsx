"use client";

import { Modal } from "@/components/admin/modal";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  itemLabel,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete this ${itemLabel}?`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </>
      }
    >
      This action can&apos;t be undone. The {itemLabel} will be permanently removed.
    </Modal>
  );
}
