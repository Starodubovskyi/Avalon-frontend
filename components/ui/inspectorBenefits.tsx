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
    <section className="pt-16 px-4 text-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`cursor-pointer rounded-xl p-6 shadow-md text-left transition-all duration-300 ${
                isActive
                  ? "bg-teal-600 text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex justify-center items-center mx-auto mb-4 ${
                  isActive ? "bg-white text-teal-600" : "bg-gray-200 text-black"
                }`}
              >
                {feature.icon}
              </div>

              <h3
                className={`text-lg font-semibold text-center ${
                  isActive ? "text-white" : "text-black"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`mt-2 text-center text-sm ${
                  isActive ? "text-white/90" : "text-gray-600"
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
