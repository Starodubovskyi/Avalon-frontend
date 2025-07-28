"use client";
import { useEffect, useState } from "react";
import Logo from "./nav/Logo";
import NavLinks from "./nav/NavLinks";
import UserMenu from "./nav/UserMenu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/60 dark:bg-black/40 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6 py-4">
        <Logo />
        <NavLinks />
        <UserMenu />
      </div>
    </div>
  );
};

export default Navbar;
