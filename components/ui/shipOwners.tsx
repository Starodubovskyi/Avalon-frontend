import {
  Calendar,
  CreditCard,
  ChartNoAxesCombined,
  Gauge,
  Bell,
  Check,
} from "lucide-react";

const featuresTop = [
  {
    title: "Smart Fleet Dashboard",
    description: [
      "Real-time vessel tracking",
      "Compliance status monitoring",
      "Inspection schedule overview",
    ],
    icon: <Gauge className="text-teal-500" />,
    image: "/photo/hz.webp",
  },
  {
    title: "Intelligent Scheduling",
    description: [
      "Automated booking system",
      "Inspector matching",
      "Calendar synchronization",
    ],
    icon: <Calendar className="text-teal-500" />,
    image: "/photo/calendar.jpeg",
  },
];

const featuresBottom = [
  {
    title: "Smart Alerts",
    description:
      "Automated notifications for compliance deadlines and inspection requirements",
    icon: <Bell className="text-teal-500" />,
  },
  {
    title: "Digital Reports",
    description:
      "Comprehensive digital reports with photos and actionable insights",
    icon: <ChartNoAxesCombined className="text-teal-500" />,
  },
  {
    title: "Secure Payments",
    description:
      "Streamlined payment processing with complete transaction history",
    icon: <CreditCard className="text-teal-500" />,
  },
];

export default function ForShipOwners() {
  return (
    <section className="px-6 py-16 bg-white text-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">For Ship Owners</h2>
        <p className="mt-2 text-gray-600">
          Experience a new era of maritime compliance with our comprehensive
          digital solutions
        </p>

        {/* Top Row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuresTop.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row h-full"
            >
              {/* Картинка */}
              <div
                className={`md:w-1/2 h-48 md:h-auto ${
                  index === 0 ? "md:rounded-l-xl" : "md:rounded-r-xl"
                } overflow-hidden`}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Текст */}
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <ul className="space-y-2">
                  {feature.description.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-700 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresBottom.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start text-left"
            >
              <div className="mb-4">{item.icon}</div>
              <h4 className="text-lg font-semibold">{item.title}</h4>
              <p className="mt-2 text-gray-750">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
