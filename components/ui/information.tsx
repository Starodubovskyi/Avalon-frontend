import { Ship, ChartSpline, ClipboardMinus } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Your Vessel",
    description:
      "Ship owners register their vessels and provide all necessary documentation and requirements for inspection.",
    icon: <Ship className="w-10 h-10 text-black-500" />,
  },
  {
    number: "02",
    title: "Schedule Inspection",
    description:
      "Choose from our network of certified inspectors and schedule a convenient time for your vessel inspection.",
    icon: <ChartSpline className="w-10 h-10 text-black-500" />,
  },
  {
    number: "03",
    title: "Receive Reports",
    description:
      "Get detailed inspection reports with actionable insights and compliance certifications through our platform.",
    icon: <ClipboardMinus className="w-10 h-10 text-black-500" />,
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-24 text-center bg-white dark:bg-gray-900">
      <h2 className="text-4xl font-bold mb-4 text-dark-700">How It Works</h2>
      <p className="text-gray-500 text-lg mb-12">
        Our platform simplifies the ship inspection process with just three easy
        steps.
      </p>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-full mx-auto px-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-300 rounded-xl p-6 text-left shadow-lg min-h-[20rem]" // Изменено: border-gray-200 на border-gray-300, shadow-sm на shadow-lg
          >
            <div className="absolute top-4 right-6 text-gray-400 text-6xl font-bold z-0">
              {step.number}
            </div>

            <div className="relative z-10">
              <div className="mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-md border border-gray-400 bg-gray-100">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-dark-900 mb-2">
                {step.title}
              </h3>
              <p className="text-base font-semibold text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
