"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaPlus, FaTrash, FaShip } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import imageCompression from "browser-image-compression";

import ProfileHeader from "./ProfileHeader";
import Gallery from "./Gallery";

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
  tags?: string[];
  gallery?: string[];
  activityData?: { date: string; value: number }[];
};

type Company = {
  businessName: string;
  logoUrl?: string;
  activity?: string;
};

export default function UserProfile() {
  const router = useRouter();

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
    tags: [],
    gallery: [],
    activityData: [],
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
        tags: parsedUser.tags || [],
        gallery: parsedUser.gallery || [],
        activityData: parsedUser.activityData || generateFakeActivity(),
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

  function generateFakeActivity() {
    const arr = [];
    const today = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.floor(Math.random() * 10) + 1,
      });
    }
    return arr;
  }

  const saveProfile = (updatedData: User) => {
    localStorage.setItem("currentUser", JSON.stringify(updatedData));
    setUser(updatedData);
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = allUsers.map((u: User) =>
      u.email === updatedData.email ? updatedData : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setFormData(updatedData);
  };

  const handleSave = () => {
    const userToSave = {
      ...formData,
      birthDate: birthDateObj?.toISOString(),
    };
    saveProfile(userToSave);
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

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const onUploadAvatar = async (file: File) => {
    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);
    const updatedData = { ...formData, profileImage: base64 };
    saveProfile(updatedData);
  };

  const onDeleteAvatar = () => {
    const updatedData = { ...formData, profileImage: "" };
    saveProfile(updatedData);
  };

  const onAddTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      const newTags = [...(formData.tags || []), tag];
      saveProfile({ ...formData, tags: newTags });
    }
  };

  const onRemoveTag = (tag: string) => {
    const newTags = (formData.tags || []).filter((t) => t !== tag);
    saveProfile({ ...formData, tags: newTags });
  };

  const onAddImage = async (file: File) => {
    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);
    const newGallery = [...(formData.gallery || []), base64];
    const updatedData = { ...formData, gallery: newGallery };
    saveProfile(updatedData);
  };

  const onRemoveImage = (idx: number) => {
    const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
    saveProfile({ ...formData, gallery: newGallery });
  };

  const onLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      bio: "",
      country: "",
      birthDate: "",
      links: [],
      profileImage: "",
      tags: [],
      gallery: [],
      activityData: [],
    });
    router.push("/");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <ProfileHeader
          name={formData.name}
          lastName={formData.lastName}
          bio={formData.bio}
          profileImage={formData.profileImage}
          tags={formData.tags || []}
          editMode={editMode}
          onUploadAvatar={onUploadAvatar}
          onDeleteAvatar={onDeleteAvatar}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onLogout={onLogout}
        />

        {company?.businessName && (
          <a
            href="/companyprofile"
            className="block bg-white/10 border border-gray-400 shadow-lg rounded-xl p-4 flex items-center gap-4 hover:shadow-xl transition dark:bg-black/20 dark:border-white/30 dark:shadow-white/20 backdrop-blur-md"
          >
            <div className="w-12 h-12 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaShip className="text-xl text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                {company.businessName}
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-400">
                {company.activity || "No activity"}
              </p>
            </div>
          </a>
        )}
      </div>

      <div className="col-span-2 space-y-6">
        <div className="bg-white/10 border border-gray-400 shadow-lg rounded-xl p-6 relative dark:bg-black/20 dark:border-white/30 dark:shadow-white/20 backdrop-blur-md">
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            className="absolute top-4 right-4 text-gray-700 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
            type="button"
          >
            {editMode ? <FaSave /> : <FaEdit />}
          </button>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
            Personal Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                First Name
              </label>
              {editMode ? (
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-200">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                Last Name *
              </label>
              {editMode ? (
                <input
                  value={formData.lastName}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-200">
                  {user?.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                Email
              </label>
              <p className="text-gray-900 dark:text-gray-200">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                Country
              </label>
              {editMode ? (
                <select
                  value={formData.country || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
                >
                  <option value="">Select a country</option>
                  {countryList.map(([code, name]) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 dark:text-gray-200">
                  {user?.country || "—"}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                Birth Date *
              </label>
              {editMode ? (
                <DatePicker
                  selected={birthDateObj}
                  onChange={(date) => setBirthDateObj(date)}
                  className="w-full border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="Select birth date"
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  required
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-200">
                  {user?.birthDate
                    ? new Date(user.birthDate).toLocaleDateString()
                    : "—"}
                </p>
              )}
            </div>
          </div>

          {editMode && (
            <div className="mt-4">
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">
              Links
            </label>
            {editMode ? (
              <div className="space-y-2">
                {formData.links?.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={link}
                      onChange={(e) => handleLinkChange(i, e.target.value)}
                      className="flex-1 border rounded px-3 py-2 bg-white border-gray-300 text-gray-900 dark:bg-black/50 dark:border-white/20 dark:text-gray-200"
                    />
                    <button
                      onClick={() => removeLink(i)}
                      className="text-red-700"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="mt-2 inline-flex items-center text-sm text-blue-700 hover:underline"
                  type="button"
                >
                  <FaPlus className="mr-1" /> Add link
                </button>
              </div>
            ) : user?.links && user.links.length > 0 ? (
              <ul className="list-disc pl-5 text-blue-700">
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

        <Gallery
          images={formData.gallery || []}
          onAddImage={onAddImage}
          onRemoveImage={onRemoveImage}
        />
      </div>
    </div>
  );
}
