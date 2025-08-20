"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaSave,
  FaPlus,
  FaTrash,
  FaShip,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import imageCompression from "browser-image-compression";

import ProfileHeader from "./ProfileHeader";
import Gallery from "./Gallery";

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames("en"));

type Membership = {
  plan: "Basic" | "Pro" | "Business";
};

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
  phone?: string;
  address?: string;
  insurance?: string;
  membership?: Membership;
};

type Company = {
  businessName: string;
  logoUrl?: string;
  activity?: string;
};

type Task = { id: string; title: string; due?: string; done: boolean };

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
    phone: "",
    address: "",
    insurance: "",
    membership: { plan: "Basic" },
  });
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const tasksKey = useMemo(
    () => `profileTasks:${formData.email || "anon"}`,
    [formData.email]
  );

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
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
        insurance: parsedUser.insurance || "",
        membership: parsedUser.membership || { plan: "Basic" },
      });
      if (parsedUser.birthDate) setBirthDateObj(new Date(parsedUser.birthDate));
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

  useEffect(() => {
    const t = localStorage.getItem(tasksKey);
    if (t) {
      setTasks(JSON.parse(t));
    } else {
      const seed: Task[] = [
        {
          id: "t1",
          title: "Contact client for outstanding invoices (Monthly)",
          due: "Mon, 16 Aug",
          done: false,
        },
        {
          id: "t2",
          title: "Share consultation forms before the next appointment",
          due: "Tue, 25 Aug",
          done: false,
        },
        {
          id: "t3",
          title: "Schedule next personal consultation",
          due: "Wed, 26 Aug",
          done: true,
        },
      ];
      setTasks(seed);
      localStorage.setItem(tasksKey, JSON.stringify(seed));
    }
  }, [tasksKey]);

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

  const persistUser = (updatedData: User) => {
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
    persistUser(userToSave);
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
    } catch {
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
    persistUser(updatedData);
  };

  const onDeleteAvatar = () => {
    const updatedData = { ...formData, profileImage: "" };
    persistUser(updatedData);
  };

  const onAddTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      const newTags = [...(formData.tags || []), tag];
      persistUser({ ...formData, tags: newTags });
    }
  };

  const onRemoveTag = (tag: string) => {
    const newTags = (formData.tags || []).filter((t) => t !== tag);
    persistUser({ ...formData, tags: newTags });
  };

  const onAddImage = async (file: File) => {
    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);
    const newGallery = [...(formData.gallery || []), base64];
    const updatedData = { ...formData, gallery: newGallery };
    persistUser(updatedData);
  };

  const onRemoveImage = (idx: number) => {
    const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
    persistUser({ ...formData, gallery: newGallery });
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
      phone: "",
      address: "",
      insurance: "",
      membership: { plan: "Basic" },
    });
    router.push("/");
  };

  const toggleTask = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    localStorage.setItem(tasksKey, JSON.stringify(next));
  };

  const goUpgrade = () => {
    router.push("/subscriptions");
  };

  const card =
    "rounded-3xl border border-gray-200/70 bg-white/95 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-sm " +
    "dark:bg-neutral-900/70 dark:border-white/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-sm " +
    "bg-white border-gray-300 text-gray-900 " +
    "dark:bg-neutral-900/60 dark:border-white/15 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside className="col-span-1">
        <div className={card + " p-5"}>
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

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Info
              </h3>
              <button
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                className="text-xs inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:underline"
                type="button"
              >
                {editMode ? (
                  <>
                    <FaSave /> Save
                  </>
                ) : (
                  <>
                    <FaEdit /> Edit
                  </>
                )}
              </button>
            </div>

            <dl className="mt-4 space-y-4 text-sm">
              <Row label="Email">
                {user?.email ? (
                  <a
                    className="text-blue-700 dark:text-blue-400 hover:underline break-all"
                    href={`mailto:${user.email}`}
                  >
                    {user.email}
                  </a>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Phone number">
                {editMode ? (
                  <input
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={inputBase}
                  />
                ) : formData.phone ? (
                  <a
                    className="text-blue-700 dark:text-blue-400 hover:underline"
                    href={`tel:${formData.phone}`}
                  >
                    {formData.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Date of birth">
                {editMode ? (
                  <DatePicker
                    selected={birthDateObj}
                    onChange={(date) => setBirthDateObj(date)}
                    className={inputBase}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select birth date"
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                ) : user?.birthDate ? (
                  new Date(user.birthDate).toLocaleDateString()
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Home address">
                {editMode ? (
                  <input
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className={inputBase}
                  />
                ) : formData.address ? (
                  formData.address
                ) : (
                  "—"
                )}
              </Row>

              <Row label="Country">
                {editMode ? (
                  <select
                    value={formData.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className={inputBase}
                  >
                    <option value="">Select a country</option>
                    {countryList.map(([code, name]) => (
                      <option key={code} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  user?.country || "—"
                )}
              </Row>

              <Row label="Insurance">
                {editMode ? (
                  <input
                    value={formData.insurance || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, insurance: e.target.value })
                    }
                    className={inputBase}
                  />
                ) : formData.insurance ? (
                  formData.insurance
                ) : (
                  "—"
                )}
              </Row>
            </dl>
          </div>

          {company?.businessName && (
            <a
              href="/companyprofile"
              className={
                "mt-6 block rounded-2xl border border-gray-200/70 bg-white/95 p-4 transition " +
                "hover:shadow-[0_8px_24px_rgba(2,6,23,0.08)] dark:bg-neutral-900/60 dark:border-white/10"
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-neutral-800 dark:border-white/10">
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
              </div>
            </a>
          )}

          <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10">
            <div className="p-4 bg-white/95 dark:bg-neutral-900/60">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Membership
              </h3>
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                Member Level:
                <span className="ml-2 inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {(formData.membership?.plan || "Basic").toUpperCase()}
                </span>
              </div>
              <div className="mt-3 h-12 rounded-xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5" />
            </div>
            <div className="bg-gray-50 p-4 dark:bg-white/5">
              <button
                type="button"
                onClick={goUpgrade}
                className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 py-2 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-[.98] transition dark:from-blue-500 dark:to-indigo-600"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="col-span-2 space-y-6">
        <div className={card + " p-5"}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Latest tasks
            </h3>
            <button
              type="button"
              className="text-sm text-blue-700 hover:underline dark:text-blue-400"
              onClick={() => {
                const title = prompt("New task title");
                if (!title) return;
                const t: Task = { id: crypto.randomUUID(), title, done: false };
                const next = [t, ...tasks];
                setTasks(next);
                localStorage.setItem(tasksKey, JSON.stringify(next));
              }}
            >
              Show all
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {tasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTask(t.id)}
                className={[
                  "w-full text-left rounded-2xl border px-3 py-2 flex items-center gap-3 transition",
                  "border-gray-200/70 hover:bg-gray-50/70 dark:border-white/10 dark:hover:bg-white/5",
                  t.done ? "opacity-70 line-through" : "",
                ].join(" ")}
              >
                <span className="shrink-0">
                  {t.done ? (
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FaRegCircle className="text-gray-400" />
                  )}
                </span>
                <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                  {t.title}
                </span>
                {t.due && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {t.due}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={card + " p-5"}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Pinned documents & files
            </h3>
            <span className="text-sm text-blue-700 hover:underline dark:text-blue-400">
              Show all
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {editMode ? (
              <div className="w-full space-y-2">
                {formData.links?.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={link}
                      onChange={(e) => handleLinkChange(i, e.target.value)}
                      className={inputBase}
                    />
                    <button
                      onClick={() => removeLink(i)}
                      className="text-red-700 dark:text-red-400"
                      type="button"
                      title="Remove link"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addLink}
                  className="mt-2 inline-flex items-center text-sm text-blue-700 hover:underline dark:text-blue-400"
                  type="button"
                >
                  <FaPlus className="mr-1" /> Add link
                </button>
              </div>
            ) : user?.links && user.links.length > 0 ? (
              user.links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:underline dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {link}
                </a>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No links yet.
              </span>
            )}
          </div>

          <Gallery
            images={formData.gallery || []}
            onAddImage={onAddImage}
            onRemoveImage={onRemoveImage}
          />
        </div>

        <div className={card + " p-5"}>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Latest activity
          </h3>
          <ul className="space-y-3">
            {(formData.activityData || []).slice(-5).map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  Updated personal client information
                  <span className="ml-2 text-xs text-blue-700 dark:text-blue-400">
                    {a.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <dt className="col-span-1 text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="col-span-2 text-gray-900 dark:text-gray-100">
        {children}
      </dd>
    </div>
  );
}
