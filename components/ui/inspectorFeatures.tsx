import { Smartphone, ChartLine } from "lucide-react";
import FeatureCard from "./featureCard";

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
    <div className="pt-24 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">For Inspectors</h2>
      <p className="text-gray-600 text-sm -mt-2 mb-10 truncate max-w-2xl mx-auto">
        Advanced tools and features designed to enhance your workflow and grow
        your business
      </p>
      <div className="flex flex-wrap justify-center gap-8">
        <FeatureCard
          title="Digital Inspection Tools"
          icon={<Smartphone size={24} />}
          features={featuresLeft}
        />
        <FeatureCard
          title="Business Analytics"
          icon={<ChartLine size={24} />}
          features={featuresRight}
        />
      </div>
    </div>
  );
}
