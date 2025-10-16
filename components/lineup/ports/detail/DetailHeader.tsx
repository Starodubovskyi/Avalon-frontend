import type { PortLite } from "@/components/lineup/ports/mockPorts";
import type { VesselCall } from "./mockPortCalls";

export default function DetailHeader({
  port,
  calls,
}: {
  port: PortLite;
  calls: VesselCall[];
}) {
  const inPort = calls.filter((c) => c.status === "In Port").length;
  const atAnchor = calls.filter((c) => c.status === "At Anchor").length;
  const inbound = calls.filter((c) => c.status === "Inbound").length;
  const outbound = calls.filter((c) => c.status === "Outbound").length;

  const Cell = ({
    label,
    value,
    tone,
  }: {
    label: string;
    value: number;
    tone: "emerald" | "amber" | "sky" | "slate";
  }) => {
    const map = {
      emerald:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300",
      amber:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300",
      sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-300",
      slate:
        "border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-200",
    } as const;
    return (
      <div className={`rounded-lg border px-3 py-2 shadow-sm ${map[tone]}`}>
        <div className="text-xs opacity-80">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
        {port.name}
      </h1>
      <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {port.country} • UN/LOCODE:{" "}
        <span className="font-mono">{port.unlocode}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cell label="In Port" value={inPort} tone="emerald" />
        <Cell label="At Anchor" value={atAnchor} tone="amber" />
        <Cell label="Inbound" value={inbound} tone="sky" />
        <Cell label="Outbound" value={outbound} tone="slate" />
      </div>
    </div>
  );
}
