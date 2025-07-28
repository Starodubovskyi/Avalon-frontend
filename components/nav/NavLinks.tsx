"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Ship Owners", href: "#for-ship-owners" },
  { label: "For Inspectors", href: "#for-inspectors" },
];

const NavLinks = () => {
  const [activeSection, setActiveSection] = useState<string>("#home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollPosition = scrollY + 150;

      let found = false;

      for (let i = navLinks.length - 1; i >= 0; i--) {
        const section = document.querySelector(
          navLinks[i].href
        ) as HTMLElement | null;
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].href);
          found = true;
          break;
        }
      }

      // Если совсем наверху — Home
      if (!found) {
        setActiveSection("#home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // сразу при загрузке

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="hidden md:flex gap-6">
      {navLinks.map((link) => {
        const isActive = activeSection === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            className={`transition-colors duration-300 hover:text-black dark:hover:text-white ${
              isActive
                ? "text-black dark:text-white font-bold"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
};

export default NavLinks;
