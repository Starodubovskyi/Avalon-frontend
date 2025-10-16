export default function ProductsHeader() {
  return (
    <div className="select-none rounded-3xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-xl shadow-2xl">
      <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-black leading-none text-transparent md:text-5xl">
        Products
      </h1>
      <div className="mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 blur-[0.5px]" />
      <p className="mt-2 text-[10px] tracking-[0.28em] text-white/70 md:text-xs">
        SELECT&nbsp;A&nbsp;CATEGORY
      </p>
    </div>
  );
}
