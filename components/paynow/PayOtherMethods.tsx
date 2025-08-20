"use client";

import { FaPaypal, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

type Provider = "paypal" | "googlepay" | "applepay";

export default function PayOtherMethods({
  onChoose,
}: {
  onChoose: (p: Provider) => void;
}) {
  const items: { id: Provider; label: string; Icon: JSX.Element }[] = [
    { id: "paypal", label: "PayPal", Icon: <FaPaypal className="text-2xl text-[#003087]" /> },
    { id: "googlepay", label: "Google Pay", Icon: <FcGoogle className="text-2xl" /> },
   { id: "applepay", label: "Apple Pay", Icon: (
    <FaApple className="text-2xl text-black dark:text-white" />
)},
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3"
    >
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChoose(id)}
          className="w-full inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-gray-50 transition dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          <span className="inline-flex items-center gap-3">
            <span className="grid h-8 w-8 place-content-center rounded-md bg-transparent">
  {Icon}
</span>

            {label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Redirect</span>
        </button>
      ))}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        We’ll redirect you to the provider to complete the payment securely.
      </p>
    </motion.div>
  );
}
