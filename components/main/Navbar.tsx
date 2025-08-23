"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../nav/Logo";
import ThemeToggler from "../ThemeToggler";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AuthModalContent from "../auth/AuthModalContent";
import ResponsiveDialogContent from "../ui/ResponsiveDialogContent";
import { useReducedMotion } from "framer-motion";

const DialogOverlay = () => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true" />
);

/* Типы */
type NavLinkId = "home" | "how-it-works" | "for-ship-owners" | "for-inspectors";
type NavLink = { id: NavLinkId; label: string };

const NAV_IDS_SET = new Set<NavLinkId>([
  "home",
  "how-it-works",
  "for-ship-owners",
  "for-inspectors",
]);

const navLinks: NavLink[] = [
  { id: "home",            label: "Home" },
  { id: "how-it-works",    label: "How It Works" },
  { id: "for-ship-owners", label: "For Ship Owners" },
  { id: "for-inspectors",  label: "For Inspectors" },
];

function isNavLinkId(v: string): v is NavLinkId {
  return NAV_IDS_SET.has(v as NavLinkId);
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<NavLinkId>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScrollFlag = () => setIsScrolled(window.scrollY > 10);
    onScrollFlag();
    window.addEventListener("scroll", onScrollFlag, { passive: true });
    return () => window.removeEventListener("scroll", onScrollFlag);
  }, []);

  const checkLoginStatus = () => {
    const loggedInStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsLoggedIn(loggedInStatus);
    const userData = localStorage.getItem("currentUser");
    setCurrentUser(userData ? JSON.parse(userData) : null);
  };
  useEffect(() => {
    checkLoginStatus();
    const onStorage = () => checkLoginStatus();
    const onAuthChange = () => checkLoginStatus();
    window.addEventListener("storage", onStorage);
    window.addEventListener("authchange", onAuthChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authchange", onAuthChange);
    };
  }, []);

  // Жёсткая блокировка фон-скролла для мобильного меню/модалки
  useEffect(() => {
    const lock = isMobileMenuOpen || isLoginModalOpen;
    if (lock) {
      const scrollY = window.scrollY;
      (document.body as any).dataset.scrollY = String(scrollY);
      document.body.classList.add("menu-open");
      (document.body.style as any).position = "fixed";
      (document.body.style as any).top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      const prev = parseInt((document.body as any).dataset.scrollY || "0", 10);
      document.body.classList.remove("menu-open");
      (document.body.style as any).position = "";
      (document.body.style as any).top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, prev);
      delete (document.body as any).dataset.scrollY;
    }
    return () => {};
  }, [isMobileMenuOpen, isLoginModalOpen]);

  const scrollTo = (id: NavLinkId) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const safeTop =
      Number(getComputedStyle(document.documentElement).getPropertyValue("--sat").replace("px", "")) || 0;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - safeTop - 4;
    window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  // rAF-троттлинг: активная секция переключается без лагов и не блокирует клики
  useEffect(() => {
    const sections = [
      "home",
      "how-it-works",
      "for-ship-owners",
      "for-inspectors",
    ]
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));

    if (!sections.length) return;

    const calc = () => {
      const center = window.innerHeight / 2;
      let bestId: NavLinkId | null = null;
      let bestDist = Infinity;

      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        const targetCenter = rect.top + rect.height / 2;
        const dist = Math.abs(targetCenter - center);
        const id = el.id;
        if (isNavLinkId(id) && dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }

      if (bestId) setActiveSection(bestId);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        calc();
        ticking = false;
      });
    };

    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast({ title: "Logged Out", description: "You have successfully logged out." });
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event("authchange"));
    router.push("/");
  };

  const handleGetStartedClick = () => {
    if (isLoggedIn) router.push("/maps");
    else setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const chipBase = "px-5 py-2 rounded-full font-semibold border text-sm transition-all duration-300";
  const chipGhost = "border-white/10 bg-white/5 text-white hover:bg-white/12 backdrop-blur-xl";
  const chipActive = "border-white/20 bg-white/16 text-white shadow-[0_6px_24px_rgba(255,255,255,0.12)]";
  const getStartedClass =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-3 font-semibold border border-white/15 bg-white/10 text-white backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-all duration-300 hover:bg-white/20";

  const barClass = useMemo(
    () =>
      `sticky top-[max(env(safe-area-inset-top),0px)]
       w-full relative z-[1000] isolate pointer-events-auto
       transition-all duration-300 ${
        isScrolled
          ? "bg-white/6 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          : "bg-transparent"
      }`,
    [isScrolled]
  );

  return (
    <div
      ref={headerRef}
      className={barClass}
      style={{
        ["--sat" as any]: "env(safe-area-inset-top)",
        WebkitBackdropFilter: isScrolled ? "saturate(180%) blur(12px)" : undefined,
        transform: "translateZ(0)",
        willChange: "transform",
        contain: "paint", // изоляция слоя — меньше артефактов хит-теста
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-8 lg:px-10">
        <div className="flex items-center justify-between py-2 sm:py-3 md:py-4 min-h-[56px]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="cursor-pointer -ml-1 sm:ml-0 active:opacity-80 pointer-events-auto"
            style={{ touchAction: "manipulation" }}
            aria-label="Go to top"
          >
            <Logo />
          </button>

          <nav className="hidden md:flex items-center gap-3 pointer-events-auto">
            {navLinks.map((link: NavLink) => {
              const active = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  aria-current={active ? "page" : undefined}
                  className={`${chipBase} ${active ? chipActive : chipGhost} pointer-events-auto`}
                  style={{ touchAction: "manipulation" }}
                  onClick={() => scrollTo(link.id)}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2 pointer-events-auto">
            <ThemeToggler
              className="p-2 rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-xl hover:bg-white/10 transition-all"
            />

            {!isLoggedIn ? (
              <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                <DialogTrigger asChild>
                  <button className={`${chipBase} ${chipGhost}`} style={{ touchAction: "manipulation" }}>
                    Log In
                  </button>
                </DialogTrigger>
                {isLoginModalOpen && (
                  <>
                    <DialogOverlay />
                    <ResponsiveDialogContent className="z-50">
                      <AuthModalContent onCloseModal={() => setIsLoginModalOpen(false)} />
                    </ResponsiveDialogContent>
                  </>
                )}
              </Dialog>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" style={{ touchAction: "manipulation" }}>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name || "User"} />
                    <AvatarFallback className="text-white bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-1">
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.795 0-5.419-.305-7.85-2.07a.75.75 0 01-.438-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/10 text-white border border-white/15">
                  <DropdownMenuLabel className="text-white">
                    My Account
                    {currentUser?.email && <div className="text-xs text-white/70">{currentUser.email}</div>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="hover:bg-white/10">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button onClick={handleGetStartedClick} className={getStartedClass} style={{ touchAction: "manipulation" }}>
              <span className="relative block overflow-hidden h-6">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">Get Started</span>
                <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                  Right Now
                </span>
              </span>
              <span className="flex items-center justify-center w-6 h-6 bg-white text-black rounded-full transition-transform duration-300 group-hover:rotate-45">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5L16.5 7.5M16.5 7.5H10.5M16.5 7.5V13.5" />
                </svg>
              </span>
            </button>
          </div>

          <button
            className="md:hidden p-3 -mr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 active:opacity-80 pointer-events-auto"
            style={{ touchAction: "manipulation" }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] md:hidden h-[100svh] overflow-hidden"
        >
          <button
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div
            className={`fixed left-0 right-0 bottom-0 rounded-t-3xl border-t border-white/10
              bg-white/10 backdrop-blur-2xl shadow-2xl
              animate-slideUp will-change-transform
              max-h-[88svh] overflow-y-auto overscroll-contain
              px-5 pt-3 pb-[calc(18px+env(safe-area-inset-bottom))]`}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-white/25 mb-2" />
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link: NavLink)=> {
                const active = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    className={`w-full text-base sm:text-lg py-3.5 rounded-xl font-semibold border text-white transition-colors duration-200
                      ${active ? "border-white/20 bg-white/16" : "border-white/10 bg-white/5 hover:bg-white/12"}`}
                    style={{ touchAction: "manipulation" }}
                    onClick={() => scrollTo(link.id)}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center justify-between gap-3 mt-4">
              <ThemeToggler className="p-2.5 rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-xl" />
              {!isLoggedIn ? (
                <button
                  className="flex-1 py-3.5 rounded-xl font-semibold border border-white/15 bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
                  style={{ touchAction: "manipulation" }}
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Log In
                </button>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name || "User"} />
                    <AvatarFallback className="text-white bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-1">
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.795 0-5.419-.305-7.85-2.07a.75.75 0 01-.438-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-white truncate">{currentUser?.name || "User"}</span>
                    {currentUser?.email && <span className="text-xs text-white/70 truncate">{currentUser.email}</span>}
                  </div>
                  <button
                    className="ml-auto px-3 py-2 rounded-lg text-sm border border-white/10 bg-white/5 text-white hover:bg-red-500 hover:border-red-500 transition-colors"
                    style={{ touchAction: "manipulation" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGetStartedClick}
              className="w-full py-3.5 mt-4 rounded-xl font-semibold text-white border border-white/15 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors duration-200"
              style={{ touchAction: "manipulation" }}
            >
              <span className="relative block overflow-hidden h-6">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">Get Started</span>
                <span className="absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                  Right Now
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <>
          <DialogOverlay />
          <ResponsiveDialogContent className="z-[1001]">
            <AuthModalContent onCloseModal={() => setIsLoginModalOpen(false)} />
          </ResponsiveDialogContent>
        </>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp ${prefersReducedMotion ? "0s" : "0.35s"} cubic-bezier(.4,2,.4,1) both;
        }
        body.menu-open {
          overscroll-behavior: none;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
