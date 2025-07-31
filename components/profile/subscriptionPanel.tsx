import { useState } from "react";
import { MdEmail, MdSms, MdNotifications, MdDesktopMac } from "react-icons/md";

const SubscriptionPanel = () => {
  const [subscriptions, setSubscriptions] = useState({
    email: true,
    sms: false,
    push: true,
    webPush: false,
  });

  const toggle = (key: keyof typeof subscriptions) => {
    setSubscriptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subscription
      </h2>

      <div className="space-y-4">
        {[
          { key: "email", label: "Email", icon: <MdEmail /> },
          { key: "sms", label: "SMS", icon: <MdSms /> },
          { key: "push", label: "Push", icon: <MdNotifications /> },
          { key: "webPush", label: "Web push", icon: <MdDesktopMac /> },
        ].map(({ key, label, icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              {icon}
              <span>{label}</span>
            </div>
            <button
              onClick={() => toggle(key as keyof typeof subscriptions)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                subscriptions[key as keyof typeof subscriptions]
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  subscriptions[key as keyof typeof subscriptions]
                    ? "translate-x-5"
                    : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPanel;
