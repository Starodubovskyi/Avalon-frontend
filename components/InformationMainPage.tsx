"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ButonContackt from "./ui/ButonForMainPage";

export default function DashboardPage() {
  const [activeBlock, setActiveBlock] = useState<"contact" | "services" | null>(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessVisible(true);

    setTimeout(() => {
      setIsSuccessVisible(false);
      setActiveBlock(null);
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveBlock(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="p-12 md:p-24">
      <AnimatePresence>
        {!activeBlock && (
          <motion.div
            key="banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-[2rem] shadow-lg w-full mx-auto mt-2 bg-white"
          >
            <img
              src="/ship-inspection.jpg"
              alt="Ship"
              className="w-full h-[50rem] object-cover block rounded-[2rem]"
            />
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-6">
              <div className="text-center flex flex-col items-center max-w-3xl">
                <div className="mb-6">
                  <ButonContackt
                    onContactClick={() => setActiveBlock("contact")}
                    onServicesClick={() => setActiveBlock("services")}
                  />
                </div>
                <div className="text-white">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    One Platform to Manage All{" "}
                    <span className="italic text-teal-300">Your Ships & Cargoes</span>
                  </h2>
                  <p className="text-lg md:text-xl">
                    Connect ship owners with qualified inspectors to simplify
                    compliance and maintenance processes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBlock === "contact" && (
          <motion.div
            key="contact-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative mt-8"
          >
            <button
              className="absolute top-8 right-4 text-xl bg-none border-none text-gray-600 cursor-pointer"
              onClick={() => setActiveBlock(null)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Get in Touch
            </h3>

            <AnimatePresence>
              {isSuccessVisible && (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="bg-green-500 text-white px-5 py-3 rounded-md text-center mb-4"
                >
                  Message sent successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Message</label>
                <textarea
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md w-full transition"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBlock === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative mt-8"
          >
            <button
              className="absolute top-8 right-4 text-xl bg-none border-none text-gray-600 cursor-pointer"
              onClick={() => setActiveBlock(null)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Our Services
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We track X% of ships worldwide.</li>
              <li>
                We provide information about what is on the ship and how much it
                is.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
