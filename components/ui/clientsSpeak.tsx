"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const clients = [
  {
    name: "Sarah Williams",
    job: "Marine Surveyor, Atlantic Certification",
    image: "/photo/sarah.jpg",
    description: "40% faster inspections and more premium clients.",
    date: "January, 2025",
    rating: 4.9,
  },
  {
    name: "Vasilii Shevchuk",
    job: "Owner",
    image: "/photo/james.jpg",
    description:
      "ShipInspect gives real-time compliance tracking for our 35 vessels, delivering strong ROI.",
    date: "January, 2025",
    rating: 5.2,
  },
  {
    name: "Captain Robert",
    job: "Fleet Manager, OceanLine Shipping",
    image: "/photo/captain.jpg",
    description:
      "ShipInspect cut compliance issues 75% and ensures quality with verified inspectors.",
    date: "January, 2025",
    rating: 4.9,
  },
];

export default function ClientsSpeak() {
  const [activeIndex, setActiveIndex] = useState(1);

  const prev = () => {
    setActiveIndex((prev) => (prev === 0 ? clients.length - 1 : prev - 1));
  };

  const next = () => {
    setActiveIndex((prev) => (prev === clients.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 text-center bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-4xl font-bold mb-2 text-black dark:text-white">
        Clients Speak Volumes About Us
      </h2>
      <p className="text-gray-600 mb-10 font-medium dark:text-gray-300">
        Hear from ship owners and inspectors who use our platform
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {clients.map((client, index) => (
          <AnimatePresence key={client.name}>
            <motion.div
              layout
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: activeIndex === index ? 1.02 : 1,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`w-full h-full rounded-2xl p-6 border shadow-sm ${
                activeIndex === index
                  ? "border-teal-500 shadow-lg bg-white dark:bg-gray-700"
                  : "bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              <img
                src={client.image}
                alt={client.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-bold text-black dark:text-white">
                {client.name}
              </h3>
              <p className="text-teal-600 text-sm font-semibold mb-2">
                {client.job}
              </p>
              <p className="text-gray-700 text-sm font-medium mb-4 dark:text-gray-300">
                {client.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500 font-medium dark:text-gray-400">
                <span>{client.date}</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" /> {client.rating}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <motion.button
          onClick={prev}
          whileTap={{ scale: 2 }}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
        >
          <ChevronLeft />
        </motion.button>

        <motion.button
          onClick={next}
          whileTap={{ scale: 2 }}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
        >
          <ChevronRight />
        </motion.button>
      </div>
    </section>
  );
}
