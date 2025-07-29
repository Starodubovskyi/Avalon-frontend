// components/InspectorFeatures.tsx
import { Smartphone, ChartLine } from "lucide-react";
import styles from "./InspectorFeatures.module.css";
import FeatureCard from "./featureCard";

const featuresLeft = [
  {
    title: "Smart Checklists",
    description: "Customizable templates for different vessel types",
  },
  {
    title: "Photo Documentation",
    description: "built in photo capture with animations",
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
    <div className={styles.container}>
      <h2 className={styles.title}>For Inspectors</h2>
      <p className={styles.subtitle}>
        Advanced tools and features designed to enhance your workflow and grow
        your business
      </p>
      <div className={styles.cards}>
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
