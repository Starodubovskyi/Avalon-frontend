import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="w-full bg-black text-white px-8 py-16 rounded-[40px]  ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex-1 min-w-[250px]">
          <div className=" flex items-center gap-2 text-xl font-semibold mb-4 ">
            <img
              src="/photo/logo1.png"
              alt="Ship.Inspect"
              className="w-8 h-8 object-contain invert"
            />
            Ship.Inspect
          </div>
          <p className="text-gray-400 max-w-xs mb-12">
            Connecting ship owners and inspectors for streamlined maritime
            compliance.
          </p>

          <form className="flex bg-white rounded-full overflow-hidden max-w-md">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 text-black outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-black p-3 text-white flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 flex-1 min-w-[250px]">
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Integration</li>
              <li className="hover:text-white cursor-pointer">Pricing Plan</li>
              <li className="hover:text-white cursor-pointer">Features</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer">Contact Us</li>
              <li className="hover:text-white cursor-pointer">
                API Documentation
              </li>
              <li className="hover:text-white cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer">
                Inspector Directory
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
            >
              <FaFacebook size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
            >
              <FaTwitter size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
            >
              <FaLinkedin size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
            >
              <FaYoutube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
