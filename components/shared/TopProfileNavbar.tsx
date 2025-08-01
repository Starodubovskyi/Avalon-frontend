"use client";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function TopProfileNavbar({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "company", label: "Company Profile" },
    { id: "services", label: "My Online Services" },
    { id: "subscriptions", label: "My Subscribes" },
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-medium ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
