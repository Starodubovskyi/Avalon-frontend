"use client";

import { useState } from "react";
import { BadgeCheck, Headphones, Globe2 } from "lucide-react";
import styles from "./InspectorBenefits.module.css";

const benefits = [
  {
    title: "Certification Tracking",
    description:
      "Manage your professional certifications and credentials in one place",
    icon: <BadgeCheck size={32} />,
  },
  {
    title: "Client Management",
    description: "Build and maintain strong relationships with ship owners",
    icon: <Headphones size={32} />,
  },
  {
    title: "Global Network",
    description: "Connect with ship owners worldwide and expand your reach",
    icon: <Globe2 size={32} />,
  },
];

export default function InspectorBenefits() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.cards}>
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className={`${styles.card} ${
              activeIndex === index ? styles.highlight : ""
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <div className={styles.icon}>{benefit.icon}</div>
            <h3 className={styles.title}>{benefit.title}</h3>
            <p className={styles.description}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
