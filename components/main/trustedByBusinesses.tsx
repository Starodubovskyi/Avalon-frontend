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
    <section
      id="trusted-by-businesses"
      className="w-full h-full px-4 md:px-8 lg:px-10 py-10 lg:py-0 flex flex-col lg:flex-row items-center justify-center gap-10 scroll-mt-24"
    >
      {/* Левая колонка: аккордеон */}
      <div className="w-full lg:w-1/2 self-stretch flex flex-col justify-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Trusted by Businesses
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/70 text-sm mb-8"
        >
          We deliver reliability with cutting-edge technology, real-time tracking, and a commitment
          to on-time performance, ensuring seamless logistics solutions.
        </motion.p>

        <div className="divide-y divide-white/10">
          {text.map((item, index) => (
            <div key={index} className="py-3">
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-xl text-white/80">
                  {activeIndex === index ? <ChevronDown /> : <ChevronRight />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.p
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-white/70 mt-1 overflow-hidden"
                  >
                    {item.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Правая колонка: метрики + изображение */}
      <div className="w-full lg:w-1/2 self-stretch flex flex-col items-center justify-center gap-4">
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4">
            <h2 className="text-3xl font-bold">25+</h2>
            <p className="text-sm text-white/70">Winning award best shipping company</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4">
            <h2 className="text-3xl font-bold">100K+</h2>
            <p className="text-sm text-white/70">Happy customers around the world</p>
          </div>
        </div>

        <div className="w-full">
          <img
            src="/photo/shipgruz.jpg"
            alt="ship"
            className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] object-cover w-full h-[42vh] md:h-[50vh] lg:h-[56vh]"
          />
        </div>
      </div>
    </section>
  );
}
