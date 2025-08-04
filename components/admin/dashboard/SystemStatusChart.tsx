import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { mockData } from "@/components/shared/mockData";

const SystemStatusChart: React.FC = () => {
  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];
  return (
    <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        System Status
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={mockData.systemStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {mockData.systemStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm mt-4">
        {mockData.systemStatusData.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="text-gray-700 dark:text-gray-300">
              {item.name} {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatusChart;
