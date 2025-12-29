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
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
      <DialogContent className="sm:max-w-lg rounded-[2rem] border-none bg-white/95 dark:bg-[#161b22] backdrop-blur-xl p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Quick Edit
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Updating details for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {company?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CompanyStatus)}
            >
              <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50 h-11 dark:border-white/10 dark:bg-white/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Owner Email
            </Label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="owner@email.com"
              className="rounded-xl border-gray-200 bg-gray-50/50 h-11 dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Tags
            </Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="priority, verified..."
              className="rounded-xl border-gray-200 bg-gray-50/50 h-11 dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
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
            className={clsx(
              "rounded-full px-6 font-bold text-white shadow-lg active:scale-95 transition-transform",
              GRADIENT_BG
            )}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
