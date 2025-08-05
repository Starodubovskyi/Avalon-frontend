import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Confirm Deletion
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this company? This action cannot be
          undone.
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="rounded-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 px-6 py-2"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
