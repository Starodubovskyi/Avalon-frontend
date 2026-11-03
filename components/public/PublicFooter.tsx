import Link from "next/link";
import { useTranslations } from "next-intl";
import { PORT_GUIDE } from "@/lib/public/portGuide";
import { PublicLogo } from "./PublicHeader";

const LINKS = [
  {
    title: "clients",
    items: [
      { href: "/request", key: "request" },
      { href: "/estimate", key: "estimate" },
      { href: "/auth", key: "login" },
    ],
  },
  {
    title: "company",
    items: [
      { href: "/#services", key: "services" },
      { href: "/#process", key: "process" },
      { href: "/port-guide", key: "portGuide" },
    ],
  },
] as const;

export function PublicFooter() {
  const t = useTranslations("publicPages");
  return (
    <footer className="bg-sidebar-gradient text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="max-w-xs">
          <PublicLogo inverted />
          <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">
            {t("footer.about")}
          </p>
        </div>
        {LINKS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted/80">{t(`footer.${col.title}`)}</p>
            <ul className="mt-3 space-y-1">
              {col.items.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-[40px] items-center text-sm text-sidebar-foreground/90 transition hover:text-white">
                    {t(`footer.links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted/80">{t("footer.ports")}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {PORT_GUIDE.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/port-guide#${p.id.toLowerCase()}`}
                  className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-sidebar-foreground/90 transition hover:bg-white/10 hover:text-white"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-sidebar-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Avalon Shipping SRL</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
