import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { mockData } from "../shared/mockData";

const DealLossReasonsChart: React.FC = () => {
  const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];
  return (
    <div
      className="bg-white border border-gray-200 shadow rounded-2xl p-6
      dark:bg-white/5 dark:border-white/10 dark:shadow-white/10"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Deal loss reasons
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={mockData.dealLossReasons}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {mockData.dealLossReasons.map((entry, index) => (
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
      <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
        {mockData.dealLossReasons.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="text-gray-700 dark:text-gray-300">
              {item.name} {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealLossReasonsChart;
