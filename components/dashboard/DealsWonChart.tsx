"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockData } from '../shared/mockData';

const DealsWonChart: React.FC = () => (
  <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Won deals (last 12 months)</h3>
    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#1d4ed8] mr-2"></span>
          <span>Closed value</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></span>
          <span>Won deals</span>
        </div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mockData.dealsWonLast12Months} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
        <XAxis dataKey="name" tick={{ fill: 'gray' }} axisLine={{ stroke: '#e5e7eb', className: 'dark:stroke-gray-700' }} />
        <YAxis tick={{ fill: 'gray' }} axisLine={{ stroke: '#e5e7eb', className: 'dark:stroke-gray-700' }} />
        <Tooltip />
        <Line type="monotone" dataKey="won" stroke="#10b981" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="closed" stroke="#1d4ed8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default DealsWonChart;
