"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ChevronRight, ChevronDown } from "lucide-react";

const text = [
  {
    title: "99% On Time Delivery",
    description:
      "With advanced logistics planning and real time tracking, we ensure you shipments reach their destination on schedule-every time",
  },
  {
    title: "Al-Powered Tracking",
    description: "Track shipments in real-time using advanced AI algorithms.",
  },
  {
    title: "Cost-Effective Solution",
    description: "Reduce logistics costs with our smart and scalable services.",
  },
  {
    title: "24/7 Customer Support",
    description: "Get help anytime with our always-available support team.",
  },
];

export default function TrustedByBusinesses() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col lg:flex-row gap-8 px-6 py-16 items-start justify-between">
      <div className="w-full lg:w-1/2">
        <h2 className="text-4xl font-bold mb-4">Trusted by Businesses</h2>
        <p className="text-gray-600 text-sm mb-8 max-w-xl">
          We deliver reliability with cutting-edge technology, real-time
          tracking, and a commitment to on-time performance, ensuring seamless
          logistics solutions.
        </p>

        {text.map((item, index) => (
          <div
            key={index}
            onClick={() => toggleIndex(index)}
            className="cursor-pointer border-b border-gray-400 pb-4"
          >
            <div className="flex justify-between items-center py-2">
              <h3
                className={`text-lg font-semibold transition-colors ${
                  activeIndex === index ? "text-black" : ""
                }`}
              >
                {item.title}
              </h3>
              <span className="text-xl">
                {activeIndex === index ? <ChevronDown /> : <ChevronRight />}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {activeIndex === index && (
                <motion.p
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-600 mt-1 overflow-hidden"
                >
                  {item.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center">
        <div className="flex justify-between w-full mb-4 px-4">
          <div>
            <h2 className="text-3xl font-bold">25+</h2>
            <p className="text-sm text-gray-600">
              Winning award best shipping company
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">100K+</h2>
            <p className="text-sm text-gray-600">
              Happy customers around the world
            </p>
          </div>
        </div>

        <img
          src="/photo/shipgruz.jpg"
          alt="ship"
          className="rounded-[24px] shadow-lg object-cover w-full max-w-[540px] h-[400px]"
        />
      </div>
    </section>
  );
}
