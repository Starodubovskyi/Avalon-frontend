"use client";

import { FaPaypal, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import clsx from "clsx";

type Provider = "paypal" | "googlepay" | "applepay";

export default function PayOtherMethods({
  onChoose,
}: {
  onChoose: (p: Provider) => void;
}) {
  const items: {
    id: Provider;
    label: string;
    Icon: JSX.Element;
    bg?: string;
  }[] = [
    {
      id: "paypal",
      label: "PayPal",
      Icon: <FaPaypal className="text-xl text-[#003087]" />,
    },
    {
      id: "googlepay",
      label: "Google Pay",
      Icon: <FcGoogle className="text-xl" />,
    },
    {
      id: "applepay",
      label: "Apple Pay",
      Icon: <FaApple className="text-xl text-black dark:text-white" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChoose(id)}
          className={clsx(
            "group w-full flex items-center justify-between rounded-[1.5rem] border px-6 py-4 transition-all duration-200",
            "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5",
            "hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md hover:-translate-y-0.5"
          )}
        >
          <span className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-content-center rounded-full bg-gray-50 dark:bg-white/10 group-hover:scale-110 transition-transform">
              {Icon}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {label}
            </span>
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wide">
            Redirect
          </span>
        </button>
      ))}

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
        You will be redirected to the provider to complete your payment
        securely.
      </p>
    </motion.div>
  );
}
