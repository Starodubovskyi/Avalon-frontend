"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminCompany } from "./types";
import { History } from "lucide-react";

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
      <DialogContent className="sm:max-w-md rounded-[2rem] border-none bg-white/95 dark:bg-[#161b22] backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <History className="text-blue-500" /> History
            </DialogTitle>
            <p className="text-sm text-gray-500">{company?.name}</p>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="relative border-l-2 border-gray-100 dark:border-white/10 ml-2 space-y-8">
            {history.map((h, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#161b22]" />
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {new Date(h.date).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {h.user}
                    </span>{" "}
                    changed{" "}
                    <span className="font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1.5 rounded text-xs uppercase">
                      {h.field}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-50 dark:bg-white/5 p-2 rounded-lg mt-1 border border-gray-100 dark:border-white/5">
                    <span className="line-through text-gray-400">
                      {h.from || "empty"}
                    </span>{" "}
                    <span className="text-gray-400 mx-1">→</span>{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {h.to || "empty"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {history.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No history recorded
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
