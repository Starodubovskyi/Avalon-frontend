"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome2,
  IconMap2,
  IconBuildingSkyscraper,
  IconShip,
  IconLayoutDashboard,
  IconAnchor,
  IconChevronDown,
  IconChevronUp,
  IconMessageCircle2,
  IconMail,
  IconUsers,
  IconMenu2,
  IconX,
  IconBell,
  IconUserCircle,
  IconLogout,
  IconSearch,
  IconHelpCircle,
  IconPinned,
  IconPinnedOff,
  IconChevronRight,
  IconSettings,
  IconChevronRight as IconArrowRight,
  IconShield,
  IconNotes,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggler from "@/components/ThemeToggler";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";
import LogoSideBar from "@/components/ui/LogoSideBar";
import ContactModal from "@/components/support/ContactModal";
import { getCurrentSubscription } from "@/components/types/billing/subscription";
import { getPlanById } from "@/components/types/billing/plan";

type TablerIcon = React.ComponentType<Partial<IconProps>>;

type SearchItem =
  | { kind: "page"; label: string; href: string }
  | { kind: "vessel"; id: string; label: string; subtitle?: string }
  | { kind: "port"; id: string; label: string; subtitle?: string }
  | { kind: "company"; id: string; label: string; subtitle?: string };

function safeParse<T = any>(json?: string | null, fallback: T = [] as any): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}
const norm = (s: string) => s.toLowerCase().trim();
const isIMO = (q: string) => /^(\s*imo\s*)?\d{7,8}$/i.test(q);
const extractIMO = (q: string) => q.match(/\d{7,8}/)?.[0] ?? "";
const isUNLOCODE = (q: string) => /^[A-Z]{5}$/i.test(q);

const navItems = [
  { label: "Home", href: "/", icon: IconHome2 },
  { label: "Map", href: "/maps", icon: IconMap2 },
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Ports", href: "/ports", icon: IconAnchor },
  { label: "Vessels", href: "/vessels", icon: IconShip },
  { label: "Companies", href: "/companies", icon: IconBuildingSkyscraper },
];

const applicationItems = [
  { label: "Social Feed", href: "/social", icon: IconUsers },
  { label: "Chat", href: "/chat", icon: IconMessageCircle2 },
  { label: "Email", href: "/email", icon: IconMail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("sidebar:expanded");
    return saved ? saved === "1" : true;
  });
  const [pinned, setPinned] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar:pinned") === "1";
  });

  useEffect(() => {
    localStorage.setItem("sidebar:expanded", expanded ? "1" : "0");
  }, [expanded]);

  useEffect(() => {
    localStorage.setItem("sidebar:pinned", pinned ? "1" : "0");
    if (pinned && !expanded) setExpanded(true);
  }, [pinned, expanded]);

  const [showApps, setShowApps] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminMobile, setShowAdminMobile] = useState(false);
  const [hasEnterprise, setHasEnterprise] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileAnimVisible, setMobileAnimVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    lastName?: string;
    avatar?: string | null;
    email?: string | null;
  } | null>(null);

  const W_NARROW = "w-[76px]";
  const W_WIDE = "w-[280px]";

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentUser({
        name: u.name,
        lastName: u.lastName,
        avatar: u.profileImage || null,
        email: u.email || null,
      });
    } else setCurrentUser(null);
  }, []);

  useEffect(() => {
    const onAuthChange = () => {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser({
          name: u.name,
          lastName: u.lastName,
          avatar: u.profileImage || null,
          email: u.email || null,
        });
      } else setCurrentUser(null);
    };
    window.addEventListener("authchange", onAuthChange);
    return () => window.removeEventListener("authchange", onAuthChange);
  }, []);

  useEffect(() => {
    if (
      isMenuOpen ||
      isAuthModalOpen ||
      isNotifOpen ||
      isSupportOpen ||
      isContactOpen
    )
      setExpanded(true);
  }, [isMenuOpen, isAuthModalOpen, isNotifOpen, isSupportOpen, isContactOpen]);

  useEffect(() => {
    if (!expanded) setShowApps(false);
  }, [expanded]);

  useEffect(() => {
    const refreshPlan = () => {
      try {
        const sub = getCurrentSubscription?.();
        if (!sub) return setHasEnterprise(false);
        const plan = getPlanById?.(sub.planId);
        const name = plan?.name || "";
        const id = (plan as any)?.id || sub.planId;
        const slug = (plan as any)?.slug;
        const enterprise =
          name === "Maritime Enterprise" ||
          id === "enterprise" ||
          slug === "enterprise";
        setHasEnterprise(Boolean(enterprise));
      } catch {
        setHasEnterprise(false);
      }
    };
    refreshPlan();
    window.addEventListener("storage", refreshPlan);
    window.addEventListener("billing:change", refreshPlan as EventListener);
    return () => {
      window.removeEventListener("storage", refreshPlan);
      window.removeEventListener(
        "billing:change",
        refreshPlan as EventListener
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("authchange"));
    setCurrentUser(null);
    router.push("/");
  };

  const IconCell = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center justify-center w-5 h-5 min-w-[20px] shrink-0">
      {children}
    </span>
  );

  const Row = ({
    active,
    children,
    className,
  }: {
    active?: boolean;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={clsx(
        "flex items-center min-h-[44px] rounded-lg transition-colors gap-3 px-3 justify-start",
        active
          ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10",
        className
      )}
    >
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <span
      className={clsx(
        "text-[14px] font-medium tracking-[-0.01em] overflow-hidden transition-all duration-300",
        expanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
      )}
    >
      {children}
    </span>
  );

  const Secondary = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[12px] text-gray-500 dark:text-gray-400">
      {children}
    </span>
  );

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const SearchBar = () => {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<SearchItem[]>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
      const query = norm(q);
      if (!query) {
        setItems([]);
        return;
      }
      const results: SearchItem[] = [];

      const pagePool = [
        ...navItems.map((n) => ({ label: n.label, href: n.href })),
        ...applicationItems.map((n) => ({ label: n.label, href: n.href })),
        { label: "Settings", href: "/settings" },
        { label: "Support", href: "/support" },
      ];
      pagePool.forEach((p) => {
        if (norm(p.label).includes(query))
          results.push({ kind: "page", label: p.label, href: p.href });
      });

      const vessels = safeParse<any[]>(
        typeof window !== "undefined"
          ? localStorage.getItem("public:vessels")
          : "[]"
      );
      vessels.forEach((v) => {
        const nameHit = norm(v.name || "").includes(query);
        const imoHit = isIMO(q) && String(v.imo || "").includes(extractIMO(q));
        const mmsiHit =
          /\d{8,9}/.test(q) &&
          String(v.mmsi || "").includes(q.replace(/\D/g, ""));
        if (nameHit || imoHit || mmsiHit) {
          results.push({
            kind: "vessel",
            id: String(v.id),
            label: v.name || `Vessel ${v.id}`,
            subtitle: v.imo
              ? `IMO ${v.imo}`
              : v.mmsi
              ? `MMSI ${v.mmsi}`
              : undefined,
          });
        }
      });

      const ports = safeParse<any[]>(
        typeof window !== "undefined"
          ? localStorage.getItem("public:ports")
          : "[]"
      );
      ports.forEach((p) => {
        const nameHit = norm(p.port || p.name || "").includes(query);
        const unlo = String(p.unlocode || p.UNLOCODE || "");
        const unloHit = isUNLOCODE(q) && unlo.toUpperCase() === q.toUpperCase();
        if (nameHit || unloHit) {
          results.push({
            kind: "port",
            id: String(p.id),
            label: p.port || p.name,
            subtitle: unlo || undefined,
          });
        }
      });

      const companies = safeParse<any[]>(
        typeof window !== "undefined"
          ? localStorage.getItem("public:companies")
          : "[]"
      );
      companies.forEach((c) => {
        if (norm(c.name || "").includes(query)) {
          results.push({
            kind: "company",
            id: String(c.id),
            label: c.name,
            subtitle: c.country || undefined,
          });
        }
      });

      setItems(results.slice(0, 12));
      setActive(0);
    }, [q]);

    const openItem = (it: SearchItem) => {
      setOpen(false);
      setQ("");
      if (it.kind === "page") router.push(it.href);
      if (it.kind === "vessel") router.push(`/vessels/${it.id}`);
      if (it.kind === "port") router.push(`/ports/${it.id}`);
      if (it.kind === "company") router.push(`/companies/${it.id}`);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        openItem(items[active]);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQ("");
        (e.currentTarget as HTMLInputElement).blur();
      }
    };

    return (
      <div className="relative">
        <div
          className="flex items-center gap-2 min-h-[44px] px-3 rounded-lg bg-white border border-gray-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-white/5"
          role="search"
          onClick={() => setOpen(true)}
        >
          <IconCell>
            <IconSearch
              size={18}
              className="text-gray-500 dark:text-gray-400"
            />
          </IconCell>
          <span
            className={clsx(
              "flex-1 overflow-hidden transition-all duration-300",
              expanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
            )}
          >
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onKeyDown={onKeyDown}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              ref={searchInputRef}
              className="w-full bg-transparent outline-none text-[14px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Type to search…"
            />
          </span>
        </div>

        {open && expanded && items.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-lg overflow-hidden">
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((it, idx) => (
                <li key={`${it.kind}-${(it as any).id || it.label}`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => openItem(it)}
                    className={clsx(
                      "w-full text-left px-3 py-2 flex items-center gap-2",
                      idx === active
                        ? "bg-gray-100 dark:bg-white/10"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="w-5 inline-flex justify-center">
                      {it.kind === "page" && (
                        <IconChevronRight size={16} className="opacity-60" />
                      )}
                      {it.kind === "vessel" && <IconShip size={16} />}
                      {it.kind === "port" && <IconAnchor size={16} />}
                      {it.kind === "company" && (
                        <IconBuildingSkyscraper size={16} />
                      )}
                    </span>
                    <span className="flex-1 truncate">{it.label}</span>
                    {"subtitle" in it && it.subtitle && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {it.subtitle}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const PinButton = () => (
    <button
      onClick={() => setPinned((p) => !p)}
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 h-9 w-9 shadow-sm dark:bg-white/5 dark:text-gray-200 dark:border-white/10 dark:shadow-white/5"
      aria-label="Pin sidebar"
      title={pinned ? "Unpin sidebar" : "Pin sidebar"}
    >
      {pinned ? <IconPinned size={18} /> : <IconPinnedOff size={18} />}
    </button>
  );

  const containerWidth = expanded ? W_WIDE : W_NARROW;

  const Container = useMemo(
    () =>
      clsx(
        "hidden lg:flex fixed z-40",
        "top-1 left-1 bottom-1",
        "transition-[width] duration-300 overflow-hidden",
        expanded ? W_WIDE : W_NARROW
      ),
    [expanded]
  );

  const MobileRow = ({
    href,
    label,
    Icon,
    active,
    onClick,
  }: {
    href?: string;
    label: string;
    Icon: TablerIcon;
    active?: boolean;
    onClick?: () => void;
  }) =>
    href ? (
      <Link href={href} onClick={() => closeMobile()}>
        <div
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg",
            active
              ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10"
          )}
        >
          <Icon size={20} />
          <span className="text-[14px]">{label}</span>
        </div>
      </Link>
    ) : (
      <button onClick={onClick} className="w-full">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">
          <Icon size={20} />
          <span className="text-[14px]">{label}</span>
          <span className="ml-auto">
            {showApps ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </span>
        </div>
      </button>
    );

  function openMobile() {
    setIsMobileOpen(true);
    requestAnimationFrame(() => {
      setOverlayVisible(true);
      setMobileAnimVisible(true);
    });
  }

  function closeMobile() {
    setOverlayVisible(false);
    setMobileAnimVisible(false);
    setTimeout(() => setIsMobileOpen(false), 300);
  }

  const preventCollapse =
    pinned ||
    isMenuOpen ||
    isNotifOpen ||
    isAuthModalOpen ||
    isSupportOpen ||
    isContactOpen;

  const menuAnim =
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=right]:slide-in-from-left-2";

  return (
    <div className="bg-gray-100 dark:bg-black">
      <div className="fixed top-0 left-0 right-0 h-px bg-gray-200 dark:bg-white/10 z-50" />

      <div className="p-2 lg:p-1">
        <div
          className={clsx(
            Container,
            "flex flex-col justify-between rounded-3xl border border-gray-200 bg-gray-50 shadow-[0_1px_30px_rgba(0,0,0,0.05)] dark:bg-black/40 dark:border-white/10 dark:shadow-[0_1px_20px_rgba(255,255,255,0.05)]"
          )}
          onMouseEnter={() => !pinned && setExpanded(true)}
          onMouseLeave={() => {
            if (!preventCollapse) setExpanded(false);
          }}
        >
          <div>
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              {expanded ? (
                <LogoSideBar isSidebarExpanded />
              ) : (
                <div className="w-8 h-8 overflow-hidden">
                  <LogoSideBar isSidebarExpanded={false} />
                </div>
              )}
              {expanded && <PinButton />}
            </div>

            <div className="mx-3 mb-2">
              <SearchBar />
            </div>

            <div className="mx-3 mt-2 space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Row active={pathname === href}>
                    <IconCell>
                      <Icon size={20} />
                    </IconCell>
                    <Label>{label}</Label>
                  </Row>
                  {label === "Companies" && (
                    <div className="my-2 h-px bg-gray-200 dark:bg-white/10" />
                  )}
                </Link>
              ))}

              {hasEnterprise && (
                <>
                  <button
                    onClick={() => setShowAdmin((v) => !v)}
                    className="w-full"
                  >
                    <Row>
                      <IconCell>
                        <IconShield size={20} />
                      </IconCell>
                      <Label>Admin</Label>
                      <span
                        className={clsx(
                          "ml-auto transition-opacity",
                          expanded ? "opacity-100" : "opacity-0"
                        )}
                      >
                        {showAdmin ? (
                          <IconChevronUp size={16} />
                        ) : (
                          <IconChevronDown size={16} />
                        )}
                      </span>
                    </Row>
                  </button>

                  <div
                    className={clsx(
                      "relative ml-[12px] overflow-hidden transition-all duration-300 ease-out",
                      showAdmin && expanded
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10 pointer-events-none" />
                    <div className="pl-[36px] pr-1 space-y-1 pt-1 pb-2">
                      <Link href="/admin">
                        <Row
                          active={pathname === "/admin"}
                          className="relative"
                        >
                          <IconCell>
                            <IconLayoutDashboard size={18} />
                          </IconCell>
                          <span className="text-[13px]">Dashboard</span>
                        </Row>
                      </Link>

                      <Link href="/admincompanies">
                        <Row
                          active={pathname === "/admin/companies"}
                          className="relative"
                        >
                          <IconCell>
                            <IconBuildingSkyscraper size={18} />
                          </IconCell>
                          <span className="text-[13px]">Companies</span>
                        </Row>
                      </Link>
                    </div>
                  </div>
                </>
              )}

              <button onClick={() => setShowApps((v) => !v)} className="w-full">
                <Row>
                  <IconCell>
                    <IconLayoutDashboard size={20} />
                  </IconCell>
                  <Label>Applications</Label>
                  <span
                    className={clsx(
                      "ml-auto transition-opacity",
                      expanded ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {showApps ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                  </span>
                </Row>
              </button>

              <div
                className={clsx(
                  "relative ml-[12px] overflow-hidden transition-all duration-300 ease-out",
                  showApps && expanded
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10 pointer-events-none" />
                <div className="pl-[36px] pr-1 space-y-1 pt-1 pb-2">
                  {applicationItems.map(({ label, href, icon: Icon }) => (
                    <Link key={href} href={href}>
                      <Row active={pathname === href} className="relative">
                        <IconCell>
                          <Icon size={18} />
                        </IconCell>
                        <span className="text-[13px]">{label}</span>
                      </Row>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-2">
            <DropdownMenu
              onOpenChange={(open) => {
                setIsSupportOpen(open);
                if (open) setExpanded(true);
              }}
            >
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left">
                  <Row active={pathname === "/support"}>
                    <IconCell>
                      <IconHelpCircle size={20} />
                    </IconCell>
                    <Label>Support</Label>
                  </Row>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={8}
                className={clsx(
                  "w-80 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-3",
                  menuAnim
                )}
              >
                <div className="rounded-xl p-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  <div className="flex items-center gap-2">
                    <IconMessageCircle2 size={18} />
                    <span className="text-sm font-semibold">
                      We’re here to help
                    </span>
                  </div>
                  <p className="text-xs/5 opacity-90 mt-1">
                    Ask a question and we’ll get back ASAP.
                  </p>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new Event("chatbot:open"));
                      setIsSupportOpen(false);
                    }}
                    className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-white/10 ring-1 ring-white/30 px-3 py-2 text-sm font-medium hover:bg-white/20"
                  >
                    <IconMessageCircle2 size={16} />
                    Ask a question
                  </button>
                </div>

                <div className="my-3 h-px bg-gray-200 dark:bg-white/10" />

                <div className="space-y-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <IconHelpCircle size={18} />
                        Help Center
                      </span>
                      <IconArrowRight size={16} className="opacity-60" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/faq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <IconNotes size={18} />
                        Frequently Asked Questions
                      </span>
                      <IconArrowRight size={16} className="opacity-60" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsSupportOpen(false);
                      setIsContactOpen(true);
                    }}
                    className="flex items-center justify-between rounded-md px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <IconMail size={18} />
                      Contact Us
                    </span>
                    <IconArrowRight size={16} className="opacity-60" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu onOpenChange={(open) => setIsNotifOpen(open)}>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left">
                  <Row active={false}>
                    <IconCell>
                      <IconBell size={20} />
                    </IconCell>
                    <Label>Notifications</Label>
                  </Row>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={8}
                className={clsx(
                  "w-80 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-2",
                  menuAnim
                )}
              >
                <div className="px-2 pb-2">
                  <div className="text-sm font-semibold mb-2">
                    Notifications
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                      <div className="text-sm font-medium">
                        You're all caught up!
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Check back later for new announcements.
                      </div>
                    </div>
                    <Link
                      href="/notifications"
                      className="block text-center text-sm rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      Open notifications
                    </Link>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/settings">
              <Row active={pathname === "/settings"}>
                <IconCell>
                  <IconSettings size={20} />
                </IconCell>
                <Label>Settings</Label>
              </Row>
            </Link>

            <div className="my-2 h-px bg-gray-200 dark:bg-white/10" />

            {!currentUser ? (
              <Dialog
                open={isAuthModalOpen}
                onOpenChange={(open) => {
                  setIsAuthModalOpen(open);
                  if (open) setExpanded(true);
                }}
              >
                <DialogTrigger asChild>
                  <button className="w-full text-left">
                    <Row>
                      <IconCell>
                        <IconUserCircle size={20} />
                      </IconCell>
                      <div
                        className={clsx(
                          "overflow-hidden transition-all",
                          expanded
                            ? "max-w-[200px] opacity-100"
                            : "max-w-0 opacity-0"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium">
                            Sign in
                          </span>
                          <Secondary>to your account</Secondary>
                        </div>
                      </div>
                    </Row>
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-[1200px] h-[800px] flex overflow-hidden rounded-2xl">
                  <AuthModalContent
                    onCloseModal={() => setIsAuthModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <DropdownMenu
                onOpenChange={(open) => {
                  setIsMenuOpen(open);
                  if (open) setExpanded(true);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button className="w-full">
                    <div
                      className={clsx(
                        "h-11 rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-white/5 dark:border-white/10",
                        expanded
                          ? "w-full flex items-center gap-3 px-3 hover:bg-gray-50 dark:hover:bg-white/10"
                          : "mx-auto w-11 p-0 flex items-center justify-center"
                      )}
                    >
                      <div className="relative w-8 h-8">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                              <IconUserCircle size={20} />
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-black" />
                      </div>

                      <div
                        className={clsx(
                          "min-w-0 text-left overflow-hidden transition-all",
                          expanded
                            ? "max-w-[200px] opacity-100"
                            : "max-w-0 opacity-0"
                        )}
                      >
                        <div className="text-[14px] font-semibold leading-5 truncate">
                          {currentUser.name} {currentUser.lastName}
                        </div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                          {currentUser.email || "My account"}
                        </div>
                      </div>

                      {expanded && (
                        <IconChevronRight
                          size={16}
                          className="opacity-60 ml-auto"
                        />
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className={clsx(
                    "w-72 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-1",
                    menuAnim
                  )}
                >
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 mx-1 my-1 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                      <div className="relative w-10 h-10">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                              <IconUserCircle size={20} />
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-black" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold leading-5 truncate">
                          {currentUser.name} {currentUser.lastName}
                        </div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                          {currentUser.email || "My account"}
                        </div>
                      </div>
                    </div>
                  </button>

                  <DropdownMenuSeparator className="dark:bg-white/10" />

                  <DropdownMenuItem className="px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Theme</span>
                      <ThemeToggler />
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="dark:bg-white/10" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <IconLogout size={18} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div
          className={clsx(
            "hidden lg:block transition-[width] duration-300",
            expanded ? W_WIDE : W_NARROW
          )}
        />

        <button
          className="fixed bottom-4 right-4 z-[60] bg-blue-600 text-white p-2 rounded-full shadow-md lg:hidden hover:bg-blue-700"
          onClick={openMobile}
          aria-label="Open menu"
        >
          <IconMenu2 size={24} />
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 z-[70] flex lg:hidden">
            <div
              className={clsx(
                "fixed inset-0 transition-opacity duration-300 backdrop-blur-[2px]",
                overlayVisible
                  ? "bg-black/50 opacity-100"
                  : "bg-black/0 opacity-0"
              )}
              onClick={closeMobile}
            />

            <div
              className={clsx(
                "ml-auto h-full w-[85%] max-w-[360px] bg-white dark:bg-black text-gray-900 dark:text-gray-100",
                "shadow-xl relative flex flex-col transform will-change-transform rounded-l-2xl",
                "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
                mobileAnimVisible ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Menu
                </span>
                <button onClick={closeMobile} aria-label="Close menu">
                  <IconX size={24} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 min-h-[44px] px-3 rounded-lg bg-white border border-gray-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-white/5">
                  <IconSearch
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <input
                    className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                    placeholder="Search…"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {navItems.map(({ label, href, icon: Icon }) => (
                  <MobileRow
                    key={href}
                    href={href}
                    label={label}
                    Icon={Icon}
                    active={pathname === href}
                  />
                ))}

                {hasEnterprise && (
                  <>
                    <button
                      onClick={() => setShowAdminMobile((v) => !v)}
                      className="w-full"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">
                        <IconShield size={20} />
                        <span className="text-[14px]">Admin</span>
                        <span className="ml-auto">
                          {showAdminMobile ? (
                            <IconChevronUp size={16} />
                          ) : (
                            <IconChevronDown size={16} />
                          )}
                        </span>
                      </div>
                    </button>
                    <div
                      className={clsx(
                        "relative ml-3 overflow-hidden transition-all duration-300 ease-out",
                        showAdminMobile
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="absolute left-[26px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10 pointer-events-none" />

                      <div className="pl-10 pr-1 space-y-1 pt-1 pb-2">
                        <MobileRow
                          href="/admin"
                          label="Dashboard"
                          Icon={IconLayoutDashboard}
                          active={pathname === "/admin"}
                        />
                        <MobileRow
                          href="/admin/companies"
                          label="Companies"
                          Icon={IconBuildingSkyscraper}
                          active={pathname === "/admin/companies"}
                        />
                      </div>
                    </div>
                  </>
                )}

                <MobileRow
                  label="Applications"
                  Icon={IconLayoutDashboard}
                  onClick={() => setShowApps((v) => !v)}
                />
                <div
                  className={clsx(
                    "relative ml-3 overflow-hidden transition-all duration-300 ease-out",
                    showApps ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div
                    className={clsx(
                      "pl-10 pr-1 space-y-1 pt-1 pb-2 transform transition-transform duration-300",
                      showApps ? "translate-y-0" : "-translate-y-2"
                    )}
                  >
                    {applicationItems.map(({ label, href, icon: Icon }) => (
                      <MobileRow
                        key={href}
                        href={href}
                        label={label}
                        Icon={Icon}
                        active={pathname === href}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />

                <MobileRow
                  href="/support"
                  label="Support"
                  Icon={IconHelpCircle}
                  active={pathname === "/support"}
                />
                <MobileRow
                  href="/notifications"
                  label="Notifications"
                  Icon={IconBell}
                  active={pathname === "/notifications"}
                />

                <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />

                <MobileRow
                  href="/settings"
                  label="Settings"
                  Icon={IconSettings}
                  active={pathname === "/settings"}
                />
                <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  <span className="text-[14px]">Theme</span>
                  <ThemeToggler />
                </div>
                {!currentUser ? (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      closeMobile();
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">
                      <IconUserCircle size={20} />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium">Sign in</span>
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">
                          to your account
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer active:scale-[0.99] transition"
                    onClick={() => {
                      router.push("/profile");
                      closeMobile();
                    }}
                  >
                    <div className="relative w-8 h-8">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                          src={currentUser.avatar || ""}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-black" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-gray-900 dark:text-gray-100">
                        {currentUser.name} {currentUser.lastName}
                      </span>
                      <span className="text-[12px] text-gray-500 dark:text-gray-400">
                        {currentUser.email || "My account"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="ml-auto text-[13px] px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ContactModal open={isContactOpen} onOpenChange={setIsContactOpen} />
    </div>
  );
}
