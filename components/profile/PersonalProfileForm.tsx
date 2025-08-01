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
  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
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
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-300">
            {user.name ? user.name[0].toUpperCase() : "?"}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{user.email}</p>
          {user.phone && (
            <p className="text-gray-700 dark:text-gray-300">Phone: {user.phone}</p>
          )}
        </div>
      </div>

      {/* Тут можно добавить другие личные данные, например подпись и т.д. */}

    </div>
  );
};

export default PersonalProfile;
