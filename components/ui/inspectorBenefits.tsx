import { useState } from "react";
import { Medal, Headphones, Globe2 } from "lucide-react";

const features = [
  {
    icon: <Medal className="w-6 h-6 stroke-current" />,
    title: "Certification Tracking",
    description:
      "Manage your professional certifications and credentials in one place",
  },
  {
    icon: <Headphones className="w-6 h-6 stroke-current" />,
    title: "Client Management",
    description: "Build and maintain strong relationships with ship owners",
  },
  {
    icon: <Globe2 className="w-6 h-6 stroke-current" />,
    title: "Global Network",
    description: "Connect with ship owners worldwide and expand your reach",
  },
];

export default function InspectorFeatures() {
  const [activeIndex, setActiveIndex] = useState<number | null>(1);

  return (
    <section className="py-16 px-4 bg-white text-center dark:bg-gray-800 dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`cursor-pointer rounded-2xl p-8 transition-all duration-300 border shadow-md w-full ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "bg-white text-black hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center font-bold ${
                  isActive
                    ? "bg-white text-teal-700"
                    : "bg-gray-200 text-teal-700 dark:bg-gray-600 dark:text-teal-400"
                }`}
              >
                {feature.icon}
              </div>
              <h3
                className={`text-xl font-bold mb-1 ${
                  isActive ? "text-white" : "text-black dark:text-white"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`text-sm font-medium ${
                  isActive
                    ? "text-white/90"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
