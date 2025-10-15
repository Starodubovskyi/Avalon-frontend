import { Layers, Radar, Ship, Clock } from "lucide-react";

const chip =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-xl shadow-lg";

export default function MiniStats() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className={chip}>
        <Layers className="h-4 w-4" /> 5 categories
      </span>
      <span className={chip}>
        <Ship className="h-4 w-4" /> Ports coverage
      </span>
      <span className={chip}>
        <Clock className="h-4 w-4" /> ETA updates
      </span>
      <span className={chip}>
        <Radar className="h-4 w-4" /> Live soon
      </span>
    </div>
  );
}
