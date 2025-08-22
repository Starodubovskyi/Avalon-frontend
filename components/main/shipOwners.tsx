"use client";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  ChartNoAxesCombined,
  Gauge,
  Bell,
  Check,
} from "lucide-react";

const featuresWithImage = [
  {
    image: "/photo/hz.webp",
    icon: <Gauge className="text-teal-300 w-7 h-7" />,
    title: "Smart Fleet Dashboard",
    items: [
      "Real-time vessel tracking",
      "Compliance status monitoring",
      "Inspection schedule overview",
    ],
  },
  {
    image: "/photo/calendar.jpeg",
    icon: <Calendar className="text-teal-300 w-7 h-7" />,
    title: "Intelligent Scheduling",
    items: [
      "Automated booking system",
      "Inspector matching",
      "Calendar synchronization",
    ],
  },
];

const featuresWithoutImage = [
  {
    icon: <Bell className="text-teal-300 w-7 h-7" />,
    title: "Smart Alerts",
    items: [
      "Automated notifications for compliance deadlines",
      "Inspection requirements",
    ],
  },
  {
    icon: <ChartNoAxesCombined className="text-teal-300 w-7 h-7" />,
    title: "Digital Reports",
    items: ["Comprehensive digital reports with photos", "Actionable insights"],
  },
  {
    icon: <CreditCard className="text-teal-300 w-7 h-7" />,
    title: "Secure Payments",
    items: ["Streamlined payment processing", "Complete transaction history"],
  },
];

export default function ShipOwners() {
  return (
    <section
      id="for-ship-owners"
      className="relative w-full h-full text-white flex flex-col justify-center scroll-mt-24"
    >
      {/* Заголовок */}
      <div className="w-full px-4 md:px-8 lg:px-10 text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold mb-2"
        >
          For Ship Owners
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/70 text-base"
        >
          Experience a new era of maritime compliance with our comprehensive
          digital solutions
        </motion.p>
      </div>

      {/* Верхняя сетка (full-bleed) */}
      <div className="grid md:grid-cols-2 gap-8 mb-10 w-full px-4 md:px-8 lg:px-10">
        {featuresWithImage.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden"
          >
            <div className="md:w-1/2 w-full">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:border-l border-white/10 flex flex-col justify-center flex-1">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <ul className="space-y-2">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 mt-1 text-teal-300 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Нижняя сетка (full-bleed) */}
      <div className="grid md:grid-cols-3 gap-8 w-full px-4 md:px-8 lg:px-10">
        {featuresWithoutImage.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
            <ul className="space-y-2">
              {feature.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 mt-1 text-teal-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
