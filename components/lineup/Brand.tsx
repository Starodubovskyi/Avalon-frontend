import Link from "next/link";

export default function Brand() {
  return (
    <Link
      href="/"
      className="group relative inline-flex select-none items-center"
    >
      <span className="absolute -inset-3 -z-10 rounded-3xl bg-white/10 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
      <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-end gap-3">
          <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-black leading-none text-transparent md:text-5xl">
            Avalon
          </span>
          <span className="text-2xl font-semibold text-white/90 md:text-4xl">
            Ship
          </span>
        </div>
        <div className="mt-1 text-[10px] tracking-[0.28em] text-white/60 md:text-xs">
          LINE&nbsp;UP&nbsp;DASHBOARD
        </div>
      </div>
    </Link>
  );
}
