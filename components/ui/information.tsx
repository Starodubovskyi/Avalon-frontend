import styles from "./HowItWorks.module.css";
import { Ship, ChartSpline, ClipboardMinus } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Your Vessel",
    description:
      "Ship owners register their vessels and provide all necessary documentation and requirements for inspection.",
    icon: <Ship style={{ width: "40px", height: "40px", color: "#14b8a6" }} />,
  },
  {
    number: "02",
    title: "Schedule Inspection",
    description:
      "Choose from our network of certified inspectors and schedule a convenient time for your vessel inspection.",
    icon: (
      <ChartSpline
        style={{ width: "40px", height: "40px", color: "#14b8a6" }}
      />
    ),
  },
  {
    number: "03",
    title: "Receive Reports",
    description:
      "Get detailed inspection reports with actionable insights and compliance certifications through our platform.",
    icon: (
      <ClipboardMinus
        style={{ width: "40px", height: "40px", color: "#14b8a6" }}
      />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>How It Works</h2>
      <p className={styles.subtitle}>
        Our platform simplifies the ship inspection process with just three easy
        steps.
      </p>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.cardContent}>
              <div className={styles.icon}>{step.icon}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardText}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
