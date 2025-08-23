import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Footer = () => {
  return (
    <footer className="relative w-full mt-20">
      {/* мягкие подсветки */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-teal-400/10" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-violet-400/10" />
      </div>

      {/* стеклянная карточка на всю ширину */}
      <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* верхняя светящаяся линия */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* контент: вместо max-w — адаптивные внутренние паддинги */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-8 lg:px-10 py-14 text-white">
          {/* Бренд + подписка + соцсети */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 text-xl font-semibold mb-4">
              <img
                src="/photo/logo1.png"
                alt="Avalon.Ship"
                className="w-8 h-8 object-contain invert"
              />
              Avalon.Ship
            </div>
            <p className="text-white/70 mb-6">
              Connecting ship owners and inspectors for streamlined maritime
              compliance.
            </p>

            <form
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-1 bg-transparent outline-none px-3 py-2 text-sm text-white placeholder-white/60"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-white/20 bg-white/20 hover:bg-white/30 transition-all"
              >
                Subscribe
              </button>
            </form>

            <div className="flex gap-3 mt-6">
              {[
                { Icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
                { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: FaTwitter, href: "https://x.com", label: "Twitter / X" },
                { Icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Ссылки */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollTo("how-it-works")}
                    className="text-white/70 hover:text-white transition"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("for-ship-owners")}
                    className="text-white/70 hover:text-white transition"
                  >
                    For Ship Owners
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("for-inspectors")}
                    className="text-white/70 hover:text-white transition"
                  >
                    For Inspectors
                  </button>
                </li>
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  Pricing Plan
                </li>
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  Blog
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  Contact Us
                </li>
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  API Documentation
                </li>
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  Privacy Policy
                </li>
                <li className="text-white/70 hover:text-white transition cursor-pointer">
                  Inspector Directory
                </li>
              </ul>
            </div>
          </div>

          {/* Контакты + язык + аптайм */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-4">Get in touch</h4>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="text-sm text-white/90">
                <div className="mb-2">
                  <span className="text-white/60">Email:</span>{" "}
                  support@avalonshipping.com
                </div>
                <div className="mb-2">
                  <span className="text-white/60">Phone:</span> +40 (73) 334-8344
                </div>
                <div>
                  <span className="text-white/60">HQ:</span> Strada Portului 20,
                  Galati, RO
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <select
                aria-label="Language"
                className="rounded-xl border border-white/15 bg-white/10 text-white text-sm px-3 py-2 hover:bg-white/15 transition"
                defaultValue="en"
              >
                <option value="en" className="bg-gray-900 text-white">English</option>
                <option value="ro" className="bg-gray-900 text-white">Română</option>
                <option value="ru" className="bg-gray-900 text-white">Русский</option>
              </select>

              <div className="ml-auto md:ml-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Uptime 99.98%
              </div>
            </div>
          </div>
        </div>

        {/* нижняя линия */}
        <div className="border-t border-white/10 px-6 md:px-8 lg:px-10 py-5 flex flex-col md:flex-row items-center gap-4 justify-between text-sm text-white/70">
          <div className="flex items-center gap-2">
            <img
              src="/photo/logo1.png"
              alt="Avalon.Ship"
              className="w-5 h-5 object-contain invert"
            />
            <span>© {new Date().getFullYear()} Avalon.Ship. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => scrollTo("home")} className="hover:text-white transition">
              Back to top
            </button>
            <span className="text-white/30">•</span>
            <span className="hover:text-white transition cursor-pointer">Terms</span>
            <span className="text-white/30">/</span>
            <span className="hover:text-white transition cursor-pointer">Privacy</span>
            <span className="text-white/30">/</span>
            <span className="hover:text-white transition cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
