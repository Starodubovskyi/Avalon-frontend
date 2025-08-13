"use client";

import { useState } from "react";
import {
  Ship,
  Calendar,
  Package,
  CloudSun,
  Users,
  FileText,
  MessageCircle,
  Wrench,
} from "lucide-react";

export default function MyOnlineServices() {
  const [services] = useState([
    {
      id: 1,
      name: "Ship Tracking",
      description: "Track vessel positions in real time",
      icon: <Ship size={24} />,
      action: "Open",
    },
    {
      id: 2,
      name: "Port Schedule",
      description: "View upcoming port arrivals and departures",
      icon: <Calendar size={24} />,
      action: "Open",
    },
    {
      id: 3,
      name: "Cargo Details",
      description: "See cargo manifest, photos, and descriptions",
      icon: <Package size={24} />,
      action: "Open",
    },
    {
      id: 4,
      name: "Weather at Sea",
      description: "Check route weather forecast",
      icon: <CloudSun size={24} />,
      action: "Open",
    },
    {
      id: 5,
      name: "Crew Management",
      description: "Manage crew members and schedules",
      icon: <Users size={24} />,
      action: "Manage",
    },
    {
      id: 6,
      name: "Online Documents",
      description: "Access and upload vessel documents",
      icon: <FileText size={24} />,
      action: "Open",
    },
    {
      id: 7,
      name: "Messaging & Chat",
      description: "Communicate with partners and ports",
      icon: <MessageCircle size={24} />,
      action: "Chat",
    },
    {
      id: 8,
      name: "Service Requests",
      description: "Order towing, refueling, or repairs",
      icon: <Wrench size={24} />,
      action: "Request",
    },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        My Online Services
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                {service.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              {service.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
