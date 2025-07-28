import React from "react";

const steps = [
  {
    number: "01",
    icon: "/icons/ship.png",
    title: "Register Your Vessel",
    description:
      "Ship owners register their vessels and provide all necessary documentation and information.",
  },
  {
    number: "02",
    icon: "/icons/doc.png",
    title: "Schedule Inspection",
    description:
      "Choose from our network of certified inspectors and schedule a convenient time for inspection.",
  },
  {
    number: "03",
    icon: "/icons/chart.png",
    title: "Receive Reports",
    description:
      "Get detailed inspection reports with actionable insights and compliance recommendations.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-4 bg-white ">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Our platform simplifies the ship inspection process with just three
          easy steps.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white border rounded-2xl p-6 text-left overflow-hidden"
            >
              {/* Декоративная цифра справа */}
              <div className="absolute right-4 top-4 text-gray-200 text-6xl font-bold z-0">
                {step.number}
              </div>

              {/* Контент поверх */}
              <div className="relative z-10 flex flex-col items-start space-y-3">
                {/* Иконка */}
                <img
                  src={step.icon}
                  alt="Step Icon"
                  className="w-12 h-12 mb-1"
                />

                {/* Заголовок */}
                <h3 className="text-md font-bold">{step.title}</h3>

                {/* Описание */}
                <p className="text-gray-750 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
