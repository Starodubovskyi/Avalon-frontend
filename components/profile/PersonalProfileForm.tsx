"use client";

import React from "react";

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface PersonalProfileProps {
  user: UserData | null;
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({ user }) => {
  if (!user) return <div>No user data available.</div>;

  return (
    <div className="bg-white border border-gray-400 shadow-lg rounded-lg p-6 dark:bg-white/10 dark:border-white/30 dark:shadow-white/20">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
        Personal Profile
      </h2>

      <div className="flex items-center space-x-6 mb-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.name} avatar`}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-400">
            {user.name ? user.name[0].toUpperCase() : "?"}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            {user.name}
          </h3>
          <p className="text-gray-700 dark:text-gray-400">{user.email}</p>
          {user.phone && (
            <p className="text-gray-700 dark:text-gray-400">
              Phone: {user.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalProfile;
