// components/FeatureCard.tsx
import { Check } from "lucide-react";
import styles from "./FeatureCard.module.css";

export type Feature = {
  title: string;
  description: string;
};

export type FeatureCardProps = {
  title: string;
  icon: React.ReactNode;
  features: Feature[];
};

export default function FeatureCard({
  title,
  icon,
  features,
}: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconCircle}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <ul className={styles.list}>
        {features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            <div className={styles.featureBox}>
              <Check size={18} className={styles.checkIcon} />
              <div>
                <strong>{feature.title}</strong>
                <p className={styles.description}>{feature.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
