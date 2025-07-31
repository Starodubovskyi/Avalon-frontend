"use client";
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
    icon: <Gauge className="text-teal-500 w-7 h-7" />,
    title: "Smart Fleet Dashboard",
    items: [
      "Real-time vessel tracking",
      "Compliance status monitoring",
      "Inspection schedule overview",
    ],
  },
  {
    image: "/photo/calendar.jpeg",
    icon: <Calendar className="text-teal-500 w-7 h-7" />,
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
    icon: <Bell className="text-teal-500 w-7 h-7" />,
    title: "Smart Alerts",
    items: [
      "Automated notifications for compliance deadlines",
      "Inspection requirements",
    ],
  },
  {
    icon: <ChartNoAxesCombined className="text-teal-500 w-7 h-7" />,
    title: "Digital Reports",
    items: ["Comprehensive digital reports with photos", "Actionable insights"],
  },
  {
    icon: <CreditCard className="text-teal-500 w-7 h-7" />,
    title: "Secure Payments",
    items: ["Streamlined payment processing", "Complete transaction history"],
  },
];

export default function ShipOwners() {
  return (
    <section className="w-full pt-0 pb-8 text-gray-800">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold mb-2">For Ship Owners</h2>
        <p className="text-gray-600 text-base">
          Experience a new era of maritime compliance with our comprehensive
          digital solutions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10 max-w-full mx-auto px-4">
        {featuresWithImage.map((feature, index) => (
          <div
            key={index}
            className="flex flex-row bg-white rounded-2xl shadow-md overflow-hidden w-full"
          >
            <div className="w-1/2">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 border border-gray-200 flex flex-col justify-center flex-1">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <ul className="space-y-2">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-1 text-teal-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-full mx-auto px-4">
        {featuresWithoutImage.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 text-left flex flex-col justify-between w-full"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
            <ul className="space-y-2">
              {feature.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-1 text-teal-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
