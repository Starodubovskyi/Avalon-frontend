"use client";
import styles from "./ForShipOwners.module.css";
import {
  Calendar,
  CreditCard,
  ChartNoAxesCombined,
  Gauge,
  Bell,
  Check,
} from "lucide-react";

const featuresWithImage = [
  {
    image: "/photo/hz.webp",
    icon: <Gauge size={28} />,
    title: "Smart Fleet Dashboard",
    items: [
      "Real-time vessel tracking",
      "Compliance status monitoring",
      "Inspection schedule overview",
    ],
  },
  {
    image: "/photo/calendar.jpeg",
    icon: <Calendar size={28} />,
    title: "Intelligent Scheduling",
    items: [
      "Automated booking system",
      "Inspector matching",
      "Calendar synchronization",
    ],
  },
];

const featuresWithoutImage = [
  {
    icon: <Bell size={28} />,
    title: "Smart Alerts",
    items: [
      "Automated notifications for compliance deadlines",
      "Inspection requirements",
    ],
  },
  {
    icon: <ChartNoAxesCombined size={28} />,
    title: "Digital Reports",
    items: ["Comprehensive digital reports with photos", "Actionable insights"],
  },
  {
    icon: <CreditCard size={28} />,
    title: "Secure Payments",
    items: ["Streamlined payment processing", "Complete transaction history"],
  },
];

export default function ShipOwners() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>For Ship Owners</h2>
      <p className={styles.subtitle}>
        Experience a new era of maritime compliance with our comprehensive
        digital solutions
      </p>

      {/* Верхний ряд: карточки с фото */}
      <div className={styles.gridTwo}>
        {featuresWithImage.map((feature, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={feature.image} alt={feature.title} />
            </div>
            <div className={styles.content}>
              <div className={styles.iconCircle}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <ul className={styles.featureList}>
                {feature.items.map((item, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Нижний ряд: 3 карточки без фото */}
      <div className={styles.gridThree}>
        {featuresWithoutImage.map((feature, index) => (
          <div key={`noimg-${index}`} className={styles.card}>
            <div className={styles.content}>
              <div className={styles.iconCircle}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <ul className={styles.featureList}>
                {feature.items.map((item, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
