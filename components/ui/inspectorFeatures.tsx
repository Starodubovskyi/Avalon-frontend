import { Smartphone, ChartLine, CheckCircle } from "lucide-react";

const featuresLeft = [
  {
    title: "Smart Checklists",
    description: "Customizable templates for different vessel types",
  },
  {
    title: "Photo Documentation",
    description: "Built-in photo capture with animations",
  },
  {
    title: "Report Generation",
    description: "Automated professional report creation",
  },
];

const featuresRight = [
  {
    title: "Location Management",
    description: "Set your service areas and travel preferences",
  },
  {
    title: "Smart Scheduling",
    description: "Flexible calendar management system",
  },
  {
    title: "Performance Analytics",
    description: "Track your business growth and earnings",
  },
];

export default function InspectorFeatures() {
  return (
    <div className="py-24 px-4 bg-white text-center">
      <h2 className="text-5xl font-extrabold mb-4 text-black">
        For Inspectors
      </h2>
      <p className="text-gray-600 text-lg font-semibold mb-12">
        Advanced tools and features designed to enhance your workflow and grow
        your business
      </p>

      <div className="flex flex-col md:flex-row gap-4 max-w-[1600px] w-full mx-auto">
        <div className="w-full rounded-3xl border border-gray-200 shadow-sm p-10 text-left bg-white min-h-[450px]">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#E6F4F1] flex items-center justify-center mr-4">
              <Smartphone className="text-teal-600" size={22} />
            </div>
            <h3 className="text-2xl font-bold text-black">
              Digital Inspection Tools
            </h3>
          </div>
          <div className="space-y-4">
            {featuresLeft.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-5 rounded-xl flex items-start"
              >
                <CheckCircle className="text-teal-600 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="text-base font-bold text-black">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm font-semibold">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-3xl border border-gray-200 shadow-sm p-10 text-left bg-white min-h-[450px]">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#E6F4F1] flex items-center justify-center mr-4">
              <ChartLine className="text-teal-600" size={22} />
            </div>
            <h3 className="text-2xl font-bold text-black">
              Digital Inspection Tools
            </h3>
          </div>
          <div className="space-y-4">
            {featuresRight.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-5 rounded-xl flex items-start"
              >
                <CheckCircle className="text-teal-600 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="text-base font-bold text-black">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm font-semibold">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
