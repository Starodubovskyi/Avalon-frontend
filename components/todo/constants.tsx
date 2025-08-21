export const STATUSES = [
  {
    id: "todo",
    label: "To Do",
    color:
      "bg-gradient-to-b from-purple-800/40 to-purple-900/60 border-purple-500/30",
    dot: "bg-purple-400/80",
    shadow: "shadow-[0_8px_32px_0_rgba(64,0,128,0.13)]",
  },
  {
    id: "inprogress",
    label: "In Progress",
    color:
      "bg-gradient-to-b from-cyan-800/40 to-cyan-900/60 border-cyan-500/30",
    dot: "bg-cyan-300/80",
    shadow: "shadow-[0_8px_32px_0_rgba(0,220,240,0.13)]",
  },
  {
    id: "done",
    label: "Done",
    color:
      "bg-gradient-to-b from-emerald-800/40 to-emerald-900/60 border-emerald-500/30",
    dot: "bg-emerald-400/80",
    shadow: "shadow-[0_8px_32px_0_rgba(0,128,64,0.12)]",
  },
] as const;
