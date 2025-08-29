"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCompany, CompanyStatus } from "./types";

interface Props {
  open: boolean;
  company: AdminCompany | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<AdminCompany>) => void;
}

const statuses: CompanyStatus[] = [
  "draft",
  "pending",
  "published",
  "suspended",
  "archived",
];

export default function QuickEditDrawer({
  open,
  company,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<CompanyStatus>("draft");
  const [owner, setOwner] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!company) return;
    setStatus(company.status);
    setOwner(company.owner);
    setTags((company.tags || []).join(", "));
  }, [company]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Quick Edit</DialogTitle>
          <DialogDescription>
            Update basic fields for the company.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CompanyStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Owner</Label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="owner@email"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tags</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma,separated,tags"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!company) return;
              const nextTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              onSave(company.id, { status, owner, tags: nextTags });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
