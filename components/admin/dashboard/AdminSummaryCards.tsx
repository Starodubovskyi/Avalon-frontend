import React from "react";
import { mockData } from "@/components/shared/mockData";

const AdminSummaryCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {mockData.adminSummary.map((card, index) => (
      <div
        key={index}
        className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700"
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {card.title}
        </div>
        <div className="text-3xl font-bold mt-2" style={{ color: card.color }}>
          {card.value}
        </div>
      </div>
    ))}
  </div>
);

export default AdminSummaryCards;
