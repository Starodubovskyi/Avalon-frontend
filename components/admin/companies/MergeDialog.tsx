"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminCompany } from "./types";

interface Props {
  open: boolean;
  companies: AdminCompany[];
  onClose: () => void;
}

export default function MergeDialog({ open, companies, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Merge duplicates</DialogTitle>
          <DialogDescription>
            Select records to merge (demo UI).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {companies.length === 0 && (
            <div className="text-sm text-gray-500">No selected companies</div>
          )}
          {companies.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border border-gray-200 dark:border-white/10"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">
                {c.country} · {c.city} · {c.category} · status: {c.status}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button disabled title="Coming soon">
            Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
