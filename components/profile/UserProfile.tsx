"use client";

import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaPlus,
  FaTrash,
  FaShip,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames("en"));

type User = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  country?: string;
  birthDate?: string;
  links?: string[];
  profileImage?: string;
};

type Company = {
  businessName: string;
  logoUrl?: string;
  activity?: string;
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    bio: "",
    country: "",
    birthDate: "",
    links: [],
    profileImage: "",
  });
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        ...parsedUser,
        links: parsedUser.links || [],
        profileImage: parsedUser.profileImage || "",
      });
      if (parsedUser.birthDate) {
        setBirthDateObj(new Date(parsedUser.birthDate));
      }
    }

    const storedCompany = localStorage.getItem("company");
    if (storedCompany) {
      const parsed = JSON.parse(storedCompany);
      setCompany({
        businessName: parsed.businessName,
        logoUrl: parsed.logoUrl,
        activity: parsed.activity,
      });
    }
  }, []);

  const handleSave = () => {
    // Создаем объект для сохранения в localStorage, исключая большое изображение
    const userToSave = {
      ...formData,
      birthDate: birthDateObj?.toISOString(),
      profileImage: undefined, // Исключаем изображение из объекта для сохранения
    };

    localStorage.setItem("currentUser", JSON.stringify(userToSave));
    setUser(userToSave);

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = allUsers.map((u: User) =>
      u.email === userToSave.email ? userToSave : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setEditMode(false);
  };

  const handleLinkChange = (i: number, val: string) => {
    const links = [...(formData.links || [])];
    links[i] = val;
    setFormData({ ...formData, links });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...(formData.links || []), ""] });
  };

  const removeLink = (i: number) => {
    const links = [...(formData.links || [])];
    links.splice(i, 1);
    setFormData({ ...formData, links });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user)
    return <div className="text-gray-500 text-center">No user logged in</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Avatar & Company */}
      <div className="col-span-1 space-y-6">
        {/* Avatar Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-500 dark:text-gray-300 overflow-hidden">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle />
            )}
          </div>
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-4 text-sm text-gray-500 dark:text-gray-300"
            />
          )}
          <h2 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">
            {user.name} {user.lastName}
          </h2>
          {user.bio && !editMode && (
            <p className="text-gray-500 text-sm mt-1">{user.bio}</p>
          )}
        </div>

        {/* Company Card */}
        {company?.businessName && (
          <a
            href="/profile?tab=CompanyProfile"
            className="block bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaShip className="text-xl text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {company.businessName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {company.activity || "No activity"}
              </p>
            </div>
          </a>
        )}
      </div>

      {/* Right: Info */}
      <div className="col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 relative">
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
          >
            {editMode ? <FaSave /> : <FaEdit />}
          </button>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Personal Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                First Name
              </label>
              {editMode ? (
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                Last Name *
              </label>
              {editMode ? (
                <input
                  value={formData.lastName}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                Country
              </label>
              {editMode ? (
                <select
                  value={formData.country || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {countryList.map(([code, name]) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {user.country || "—"}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                Birth Date *
              </label>
              {editMode ? (
                <DatePicker
                  selected={birthDateObj}
                  onChange={(date) => setBirthDateObj(date)}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Select birth date"
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  required
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {user.birthDate
                    ? new Date(user.birthDate).toLocaleDateString()
                    : "—"}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {editMode && (
            <div className="mt-4">
              <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Links */}
          <div className="mt-4">
            <label className="text-sm text-gray-500 dark:text-gray-300 mb-1 block">
              Links
            </label>
            {editMode ? (
              <div className="space-y-2">
                {formData.links?.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={link}
                      onChange={(e) => handleLinkChange(i, e.target.value)}
                      className="flex-1 border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeLink(i)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  <FaPlus className="mr-1" /> Add link
                </button>
              </div>
            ) : user.links && user.links.length > 0 ? (
              <ul className="list-disc pl-5 text-blue-600">
                {user.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}