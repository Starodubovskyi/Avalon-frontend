import type { PortLite } from "./mockPorts";

export default function StatsBar({ ports }: { ports: PortLite[] }) {
  const total = ports.length;
  const open = ports.filter((p) => p.status === "Open").length;
  const congested = ports.filter((p) => p.status === "Congested").length;
  const closed = ports.filter((p) => p.status === "Closed").length;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Ports" value={total} tone="neutral" />
      <StatCard label="Open" value={open} tone="emerald" />
      <StatCard label="Congested" value={congested} tone="amber" />
      <StatCard label="Closed" value={closed} tone="rose" />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "emerald" | "amber" | "rose";
}) {
  const dot =
    tone === "emerald"
      ? "bg-emerald-500"
      : tone === "amber"
      ? "bg-amber-500"
      : tone === "rose"
      ? "bg-rose-500"
      : "bg-neutral-400";

  return (
    <div
      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm
                    dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
    </div>
  );
}
