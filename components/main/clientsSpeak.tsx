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

  const prev = () => setActiveIndex((p) => (p === 0 ? clients.length - 1 : p - 1));
  const next = () => setActiveIndex((p) => (p === clients.length - 1 ? 0 : p + 1));

  return (
    <section
      id="clients-speak"
      className="w-full h-full flex flex-col justify-center text-center scroll-mt-24"
    >
      {/* Заголовок */}
      <div className="w-full px-4 md:px-8 lg:px-10">
        <h2 className="text-4xl font-bold mb-2">Clients Speak Volumes About Us</h2>
        <p className="text-white/70 mb-10 font-medium">
          Hear from ship owners and inspectors who use our platform
        </p>
      </div>

      {/* Сетка карточек — full-bleed */}
      <div className="w-full px-4 md:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {clients.map((client, index) => (
          <AnimatePresence key={client.name}>
            <motion.div
              layout
              initial={{ opacity: 0.7, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: activeIndex === index ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col h-full rounded-3xl p-6 border ${
                activeIndex === index
                  ? "border-teal-400 bg-white/[0.07] backdrop-blur-xl shadow-[0_20px_60px_rgba(20,184,166,0.25)]"
                  : "border-white/10 bg-white/[0.05] backdrop-blur-xl"
              }`}
            >
              <img
                src={client.image}
                alt={client.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-bold">{client.name}</h3>
              <p className="text-teal-300 text-sm font-semibold mb-2">{client.job}</p>

              <p className="text-white/80 text-sm font-medium mb-4">{client.description}</p>

              <div className="mt-auto flex justify-between items-center text-sm text-white/60 font-medium">
                <span>{client.date}</span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" /> {client.rating}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>

      {/* Навигация */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          onClick={prev}
          whileTap={{ scale: 1.2 }}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.08] transition"
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </motion.button>

        <motion.button
          onClick={next}
          whileTap={{ scale: 1.2 }}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.08] transition"
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </motion.button>
      </div>
    </section>
  );
}
