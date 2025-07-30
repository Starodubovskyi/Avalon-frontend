import { Check } from "lucide-react";

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
    <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm border border-gray-200">
      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-teal-700">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <ul className="list-none p-0 m-0">
        {features.map((feature, index) => (
          <li key={index} className="mb-4 last:mb-0">
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
              <Check
                size={18}
                className="text-emerald-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <strong>{feature.title}</strong>
                <p className="mt-1 text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
