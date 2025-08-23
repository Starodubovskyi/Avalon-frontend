"use client";
import { motion } from "framer-motion";
import { Ship, ChartSpline, ClipboardMinus } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Your Vessel",
    description:
      "Ship owners register their vessels and provide all necessary documentation and requirements for inspection.",
    icon: <Ship className="w-6 h-6 text-teal-300" />,
  },
  {
    number: "02",
    title: "Schedule Inspection",
    description:
      "Choose from our network of certified inspectors and schedule a convenient time for your vessel inspection.",
    icon: <ChartSpline className="w-6 h-6 text-teal-300" />,
  },
  {
    number: "03",
    title: "Receive Reports",
    description:
      "Get detailed inspection reports with actionable insights and compliance certifications through our platform.",
    icon: <ClipboardMinus className="w-6 h-6 text-teal-300" />,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full h-full text-center flex flex-col justify-center scroll-mt-24"
    >
      <div className="w-full px-4 md:px-8 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          How It Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/70 text-lg mb-12"
        >
          Our platform simplifies the ship inspection process with just three easy
          steps.
        </motion.p>
      </div>

      {/* full-bleed grid без max-width */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 w-full px-4 md:px-8 lg:px-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-6 text-left min-h-[20rem] border border-white/10 bg-white/[0.05] backdrop-blur-xl"
          >
            <div className="absolute top-4 right-6 text-white/10 text-6xl font-extrabold z-0 select-none">
              {step.number}
            </div>

            <div className="relative z-10">
              <div className="mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/10">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
              <p className="text-base font-semibold text-white/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
