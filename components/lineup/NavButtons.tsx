import Link from "next/link";
import { Map, Package } from "lucide-react";

export default function NavButtons() {
  const baseBtn =
    "group inline-flex items-center justify-center gap-2 rounded-full " +
    "h-11 md:h-12 min-w-[150px] md:min-w-[180px] px-5 md:px-6 " +
    "text-sm md:text-base font-semibold transition focus:outline-none focus:ring-4";

  const iconCls = "h-5 w-5 md:h-6 md:w-6 transition";

  return (
    <div className="mt-8">
      <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-xl shadow-2xl">
        <Link
          href="/lineup/ports"
          className={`${baseBtn} text-gray-900 bg-white/90 hover:bg-white focus:ring-white/40`}
        >
          <Map className={`${iconCls} opacity-80 group-hover:opacity-100`} />
          <span>Ports</span>
        </Link>

        <Link
          href="/lineup/products"
          className={`${baseBtn} text-white border border-white/20 bg-white/0 hover:bg-white/15 focus:ring-white/30`}
        >
          <Package
            className={`${iconCls} opacity-90 group-hover:opacity-100`}
          />
          <span>Products</span>
        </Link>
      </div>
    </div>
  );
}
