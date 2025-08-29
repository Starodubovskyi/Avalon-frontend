"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminCompany } from "./types";

interface Props {
  open: boolean;
  company: AdminCompany | null;
  onClose: () => void;
}

type HistoryItem = {
  date: string;
  user: string;
  field: string;
  from?: string;
  to?: string;
};

function makeMockHistory(id: string): HistoryItem[] {
  const seed = parseInt(id, 10) || 1;
  const base = new Date("2025-08-20T12:00:00Z").getTime();
  return [
    {
      date: new Date(base + seed * 3600_000).toISOString(),
      user: "admin@avalon.app",
      field: "status",
      from: "pending",
      to: "published",
    },
    {
      date: new Date(base + seed * 5400_000).toISOString(),
      user: "mod@avalon.app",
      field: "tags",
      from: "",
      to: "supplier, priority",
    },
    {
      date: new Date(base + seed * 7200_000).toISOString(),
      user: "admin@avalon.app",
      field: "owner",
      from: "",
      to: "ops@avalon.app",
    },
  ];
}

export default function HistoryDrawer({ open, company, onClose }: Props) {
  const history = company ? makeMockHistory(company.id) : [];
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            Change history {company ? `· ${company.name}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 dark:divide-white/10">
          {history.map((h, i) => (
            <div key={i} className="py-3 text-sm">
              <div className="text-gray-500 text-xs">
                {new Date(h.date).toLocaleString()} · {h.user}
              </div>
              <div>
                <b>{h.field}</b>:{" "}
                <span className="text-gray-700 dark:text-gray-200">
                  {h.from || "—"}
                </span>{" "}
                →{" "}
                <span className="text-gray-900 dark:text-white">
                  {h.to || "—"}
                </span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-500">
              No history yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
