"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2,
  Save,
  Plus,
  Trash2,
  Anchor,
  CheckCircle2,
  Circle,
  Chrome,
  Lock,
  LogOut,
  ExternalLink,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import clsx from "clsx";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import AlertsCenter from "./AlertsCenter";
import ProfileHeader from "./ProfileHeader";
import Gallery from "./Gallery";
import ActivityFeed, { ActivityEvent, ActivityType } from "./ActivityFeed";

import { getCurrentSubscription } from "@/components/types/billing/subscription";
import {
  getPlanById,
  type Billing as BillingType,
} from "@/components/types/billing/plan";
import { AuthApi } from "@/lib/api/auth";
import { ensureAccessToken } from "@/lib/api/client";
import { CompanyApi } from "@/lib/api/company";

// --- КОНСТАНТЫ СТИЛЯ ---
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames("en"));

const SUPPORTED_TZS: string[] =
  typeof (Intl as any).supportedValuesOf === "function"
    ? (Intl as any).supportedValuesOf("timeZone")
    : ["UTC", "Europe/London", "Europe/Berlin"];

// --- ТИПЫ ---
type Membership = { plan: "Basic" | "Pro" | "Business" | string };
type WorkingHours = { from: string; to: string };
type Preferences = {
  timezone?: string;
  language?: "English";
  units?: "metric" | "imperial";
  timeFormat?: "24h" | "12h";
  currency?: "USD" | "EUR" | "GBP";
  workingHours?: WorkingHours;
  country?: string;
};
type Notifications = { inApp: boolean; email: boolean; telegram: boolean };
type Security = {
  twoFactorEnabled: boolean;
  sessions: {
    id: string;
    device: string;
    location?: string;
    lastSeen: string;
    current?: boolean;
  }[];
};
type Connected = { google: boolean };
type Usage = {
  seatsUsed: number;
  seatsTotal: number;
  storageUsedGB: number;
  storageTotalGB: number;
  apiUsed: number;
  apiLimit: number;
  watchlistUsed: number;
  watchlistLimit: number;
};
type User = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  links?: string[];
  profileImage?: string;
  tags?: string[];
  gallery?: string[];
  activityData?: { date: string; value: number }[];
  phone?: string;
  preferences?: Preferences;
  notifications?: Notifications;
  security?: Security;
  connected?: Connected;
  usage?: Usage;
  birthDate?: string;
  address?: string;
  insurance?: string;
  membership?: Membership;
  verified?: boolean;
};
type Company = { businessName: string; logoUrl?: string; activity?: string };
type Task = { id: string; title: string; due?: string; done: boolean };

export default function UserProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | number | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    bio: "",
    links: [],
    profileImage: "",
    tags: [],
    gallery: [],
    activityData: [],
    phone: "",
    preferences: {
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "UTC",
      language: "English",
      units: "metric",
      timeFormat: "24h",
      currency: "USD",
      workingHours: { from: "09:00", to: "17:00" },
      country: "",
    },
    notifications: { inApp: true, email: true, telegram: false },
    security: { twoFactorEnabled: false, sessions: [] },
    connected: { google: false },
    usage: {
      seatsUsed: 1,
      seatsTotal: 5,
      storageUsedGB: 1.2,
      storageTotalGB: 10,
      apiUsed: 57500,
      apiLimit: 500000,
      watchlistUsed: 2,
      watchlistLimit: 30,
    },
    membership: { plan: "Basic" },
    verified: false,
  });
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);

  const tasksKey = useMemo(
    () => `profileTasks:${formData.email || "anon"}`,
    [formData.email]
  );
  const activityKey = useMemo(
    () => `profileActivity:${formData.email || "anon"}`,
    [formData.email]
  );
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [subscription, setSubscription] = useState<{
    planName: string;
    billing: BillingType;
  } | null>(null);

  const seedSessions = (): Security["sessions"] => {
    const now = new Date();
    return [
      {
        id: "s1",
        device: "Chrome on Windows",
        location: "RO",
        lastSeen: now.toISOString(),
        current: true,
      },
      {
        id: "s2",
        device: "Safari on iPhone",
        location: "AT",
        lastSeen: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ];
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureAccessToken();
        const me = await AuthApi.me<any>();
        if (!mounted || !me) return;
        setUserId(me.id ?? null);
        const withDefaults: User = {
          name: (me.firstName ?? "") as string,
          lastName: (me.lastName ?? "") as string,
          email: me.email ?? "",
          password: "",
          profileImage: me.avatar ?? me.photoUrl ?? "",
          verified:
            typeof me?.status?.id !== "undefined"
              ? String(me.status.id) === "1" || me.status.id === 1
              : me?.status?.name
              ? /active/i.test(String(me.status.name))
              : false,
          links: me.links ?? [],
          tags: me.tags ?? [],
          gallery: me.gallery ?? [],
          activityData: me.activityData ?? generateFakeActivity(),
          phone: me.phone ?? "",
          preferences: {
            timezone:
              me.preferences?.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: (me.preferences?.language as any) || "English",
            units: (me.preferences?.units as any) || "metric",
            timeFormat: (me.preferences?.timeFormat as any) || "24h",
            currency: (me.preferences?.currency as any) || "USD",
            workingHours:
              (me.preferences?.workingHours as any) ||
              ({ from: "09:00", to: "17:00" } as WorkingHours),
            country: me.preferences?.country || (me as any).country || "",
          },
          notifications: me.notifications ?? {
            inApp: true,
            email: true,
            telegram: false,
          },
          security: me.security ?? {
            twoFactorEnabled: false,
            sessions: seedSessions(),
          },
          usage: me.usage ?? {
            seatsUsed: 1,
            seatsTotal: 5,
            storageUsedGB: 1.2,
            storageTotalGB: 10,
            apiUsed: 57500,
            apiLimit: 500000,
            watchlistUsed: 2,
            watchlistLimit: 30,
          },
          membership: me.membership ?? { plan: "Basic" },
          ...(typeof ({} as User).birthDate !== "undefined"
            ? { birthDate: me.birthDate ?? undefined }
            : {}),
        };
        setUser(withDefaults);
        setFormData(withDefaults);
        if (me.birthDate) setBirthDateObj(new Date(me.birthDate));
      } catch {}
      try {
        const bp = await CompanyApi.getMine().catch(() => null);
        if (mounted && bp) {
          setCompany({
            businessName: bp.businessName ?? bp.name ?? "",
            logoUrl: bp.logoUrl ?? bp.logo ?? "",
            activity: bp.activity ?? "",
          });
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const t = localStorage.getItem(tasksKey);
    if (t) {
      setTasks(JSON.parse(t));
    } else {
      const seed: Task[] = [
        { id: "t1", title: "Contact client", due: "Mon, 16 Aug", done: false },
        { id: "t2", title: "Share forms", due: "Tue, 25 Aug", done: false },
      ];
      setTasks(seed);
      localStorage.setItem(tasksKey, JSON.stringify(seed));
    }
  }, [tasksKey]);

  useEffect(() => {
    const a = localStorage.getItem(activityKey);
    setActivity(a ? JSON.parse(a) : []);
  }, [activityKey]);

  useEffect(() => {
    const refresh = () => {
      const sub = getCurrentSubscription();
      if (sub) {
        const p = getPlanById(sub.planId);
        if (p) {
          setSubscription({ planName: p.name, billing: sub.billing });
          return;
        }
      }
      setSubscription(null);
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function generateFakeActivity() {
    const arr: { date: string; value: number }[] = [];
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

  const pushActivity = (e: {
    type: ActivityType;
    title: string;
    meta?: string;
  }) => {
    const ev: ActivityEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...e,
    };
    const next = [ev, ...activity].slice(0, 300);
    setActivity(next);
    localStorage.setItem(activityKey, JSON.stringify(next));
  };
  const clearActivity = () => {
    setActivity([]);
    localStorage.removeItem(activityKey);
  };

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
    const next: User = { ...formData, birthDate: birthDateObj?.toISOString() };
    persistUser(next);
    setEditMode(false);
    pushActivity({ type: "profile", title: "Updated profile" });
  };

  const handleLinkChange = (i: number, val: string) => {
    const links = [...(formData.links || [])];
    links[i] = val;
    setFormData({ ...formData, links });
  };
  const addLink = () =>
    setFormData({ ...formData, links: [...(formData.links || []), ""] });
  const removeLink = (i: number) => {
    const links = [...(formData.links || [])];
    links.splice(i, 1);
    setFormData({ ...formData, links });
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      return await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
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
    const base64 = await fileToBase64(await compressImage(file));
    persistUser({ ...formData, profileImage: base64 });
    pushActivity({ type: "profile", title: "Changed avatar" });
  };
  const onDeleteAvatar = () => {
    persistUser({ ...formData, profileImage: "" });
    pushActivity({ type: "profile", title: "Removed avatar" });
  };
  const onAddTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      const newTags = [...(formData.tags || []), tag];
      persistUser({ ...formData, tags: newTags });
      pushActivity({ type: "tags", title: `Added tag`, meta: tag });
    }
  };
  const onRemoveTag = (tag: string) => {
    const newTags = (formData.tags || []).filter((t) => t !== tag);
    persistUser({ ...formData, tags: newTags });
    pushActivity({ type: "tags", title: `Removed tag`, meta: tag });
  };
  const onAddImage = async (file: File) => {
    const base64 = await fileToBase64(await compressImage(file));
    const newGallery = [...(formData.gallery || []), base64];
    persistUser({ ...formData, gallery: newGallery });
    pushActivity({ type: "files", title: "Uploaded image" });
  };
  const onRemoveImage = (idx: number) => {
    const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
    persistUser({ ...formData, gallery: newGallery });
    pushActivity({ type: "files", title: "Removed image" });
  };
  const onLogout = () => {
    pushActivity({ type: "security", title: "Signed out" });
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/");
  };
  const goUpgrade = () => {
    pushActivity({ type: "billing", title: "Opened subscriptions" });
    router.push("/subscriptions");
  };
  const connectGoogle = () => {
    persistUser({ ...formData, connected: { google: true } });
    pushActivity({ type: "integrations", title: "Connected Google account" });
  };
  const toggle2FA = () => {
    const enabled = !formData.security?.twoFactorEnabled;
    persistUser({
      ...formData,
      security: { ...formData.security!, twoFactorEnabled: enabled },
    });
    pushActivity({
      type: "security",
      title: `${enabled ? "Enabled" : "Disabled"} Two-Factor Authentication`,
    });
  };
  const signOutAll = () => {
    persistUser({
      ...formData,
      security: {
        ...formData.security!,
        sessions: formData.security!.sessions.slice(0, 1),
      },
    });
    pushActivity({ type: "security", title: "Signed out of other devices" });
  };
  const completeness = calcCompleteness(formData);

  useEffect(() => {
    if (!formData.verified && completeness >= 100) {
      const next = { ...formData, verified: true };
      persistUser(next);
      setShowCongrats(true);
      pushActivity({
        type: "security",
        title: "Completed account verification",
      });
    }
  }, [completeness]);
  useEffect(() => {
    if (!showCongrats) return;
    const t = setTimeout(() => setShowCongrats(false), 6000);
    return () => clearTimeout(t);
  }, [showCongrats]);

  // --- СТИЛИ ---
  const cardClass =
    "rounded-[2.5rem] border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:bg-[#0d1117]/80 dark:border-white/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-8";
  const inputBase =
    "w-full rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all";

  // --- РЕНДЕР ---
  return (
    // ИЗМЕНЕНО: убраны большие отступы, добавлен w-full min-h-screen и минимальный px-2 py-2 для отступа от краев экрана
    <div className="max-w-[1920px] mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ЛЕВАЯ КОЛОНКА */}
        <aside className="col-span-1 space-y-6">
          <div className={cardClass}>
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

            {formData.verified && showCongrats && (
              <div
                role="status"
                className="mt-6 rounded-2xl border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-800 shadow-sm dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200 backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-bold">
                      Congrats! Verification complete 🎉
                    </div>
                    <div className="opacity-90">
                      You have completed all key profile steps.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCongrats(false)}
                    className="rounded-full px-3 py-1 text-xs bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {!formData.verified && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Profile Completion
                </h3>
                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full ${GRADIENT_BG} transition-all duration-500`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                  {completeness}% complete
                </p>

                <ul className="mt-4 space-y-3">
                  <CheckRow done={!!formData.phone}>Add phone</CheckRow>
                  <CheckRow done={!!formData.preferences?.timezone}>
                    Set timezone
                  </CheckRow>
                  <CheckRow done={!!formData.connected?.google}>
                    Connect Google
                    {!formData.connected?.google && (
                      <button
                        onClick={connectGoogle}
                        className="ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                      >
                        <Chrome size={12} /> Connect
                      </button>
                    )}
                  </CheckRow>
                  <CheckRow done={!!formData.security?.twoFactorEnabled}>
                    Enable 2FA
                  </CheckRow>
                </ul>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Details
                </h3>
                <button
                  onClick={() => (editMode ? handleSave() : setEditMode(true))}
                  className="text-xs font-bold inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  {editMode ? (
                    <>
                      <Save size={14} /> Save
                    </>
                  ) : (
                    <>
                      <Edit2 size={14} /> Edit
                    </>
                  )}
                </button>
              </div>

              <dl className="space-y-5 text-sm">
                <Row label="Email">
                  {user?.email ? (
                    <a
                      className="text-blue-600 hover:underline break-all font-medium"
                      href={`mailto:${user.email}`}
                    >
                      {user.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row label="Phone">
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
                      className="text-blue-600 hover:underline font-medium"
                      href={`tel:${formData.phone}`}
                    >
                      {formData.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row label="Timezone">
                  {editMode ? (
                    <div className="relative">
                      <select
                        value={formData.preferences?.timezone || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences!,
                              timezone: e.target.value,
                            },
                          })
                        }
                        className={`${inputBase} appearance-none cursor-pointer`}
                      >
                        <option value="">Select timezone</option>
                        {SUPPORTED_TZS.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    formData.preferences?.timezone || "—"
                  )}
                </Row>
                <Row label="Hours">
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={
                          formData.preferences?.workingHours?.from || "09:00"
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences!,
                              workingHours: {
                                from: e.target.value,
                                to:
                                  formData.preferences?.workingHours?.to ||
                                  "17:00",
                              },
                            },
                          })
                        }
                        className={inputBase}
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="time"
                        value={
                          formData.preferences?.workingHours?.to || "17:00"
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences!,
                              workingHours: {
                                from:
                                  formData.preferences?.workingHours?.from ||
                                  "09:00",
                                to: e.target.value,
                              },
                            },
                          })
                        }
                        className={inputBase}
                      />
                    </div>
                  ) : formData.preferences?.workingHours ? (
                    `${formData.preferences.workingHours.from} – ${formData.preferences.workingHours.to}`
                  ) : (
                    "—"
                  )}
                </Row>
                <Row label="Country">
                  {editMode ? (
                    <select
                      value={formData.preferences?.country || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences!,
                            country: e.target.value,
                          },
                        })
                      }
                      className={`${inputBase} appearance-none cursor-pointer`}
                    >
                      <option value="">Select country</option>
                      {countryList.map(([code, name]) => (
                        <option key={code} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    formData.preferences?.country || "—"
                  )}
                </Row>
              </dl>
            </div>

            {company?.businessName && (
              <a
                href="/companyprofile"
                className="mt-8 block rounded-[1.5rem] bg-gray-50 dark:bg-white/5 p-4 transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-white dark:bg-black shadow-sm">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Anchor className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {company.businessName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {company.activity || "Company"}
                    </p>
                  </div>
                  <ExternalLink
                    className="ml-auto text-gray-400 group-hover:text-blue-500 transition-colors"
                    size={16}
                  />
                </div>
              </a>
            )}

            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <div className="p-2 rounded-full bg-white dark:bg-white/10 shadow-sm">
                      <Lock size={16} className="text-blue-500" />
                    </div>
                    Two-Factor Auth
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.security?.twoFactorEnabled}
                      onChange={toggle2FA}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="rounded-[1.5rem] border border-gray-200 dark:border-white/10 p-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Active Sessions
                  </div>
                  <ul className="space-y-3">
                    {(formData.security?.sessions || seedSessions()).map(
                      (s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {s.device}{" "}
                              {s.current && (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                                  Current
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {s.location || "Unknown"} •{" "}
                              {new Date(s.lastSeen).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                  <button
                    onClick={signOutAll}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-white/10 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={14} /> Sign out other devices
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-gray-900 to-black text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {(
                        subscription?.planName ||
                        formData.membership?.plan ||
                        "Basic"
                      ).toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium mt-1">
                      {subscription?.billing === "monthly"
                        ? "Billed Monthly"
                        : "Billed Annually"}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/10">
                    Active
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <UsageBar
                    label="Seats"
                    used={formData.usage!.seatsUsed}
                    total={formData.usage!.seatsTotal}
                  />
                  <UsageBar
                    label="Storage (GB)"
                    used={formData.usage!.storageUsedGB}
                    total={formData.usage!.storageTotalGB}
                  />
                  <UsageBar
                    label="API Credits"
                    used={formData.usage!.apiUsed}
                    total={formData.usage!.apiLimit}
                  />
                </div>

                {subscription ? (
                  <button
                    onClick={() => router.push("/billing")}
                    className="w-full py-3 rounded-full bg-white text-black text-sm font-bold shadow-lg hover:bg-gray-100 transition active:scale-95"
                  >
                    Manage Billing
                  </button>
                ) : (
                  <button
                    onClick={goUpgrade}
                    className={`w-full py-3 rounded-full text-white text-sm font-bold shadow-lg hover:opacity-90 transition active:scale-95 ${GRADIENT_BG}`}
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ПРАВАЯ КОЛОНКА */}
        <section className="col-span-1 lg:col-span-2 space-y-6">
          <div className={cardClass}>
            <AlertsCenter userEmail={formData.email} />
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Pinned Links
              </h3>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {editMode ? (
                <div className="w-full space-y-3">
                  {formData.links?.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={link}
                        onChange={(e) => handleLinkChange(i, e.target.value)}
                        className={inputBase}
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => removeLink(i)}
                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addLink}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                  >
                    <Plus size={16} /> Add Link
                  </button>
                </div>
              ) : user?.links && user.links.length > 0 ? (
                user.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <ExternalLink size={14} /> {link}
                  </a>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">
                  No pinned links.
                </span>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-white/5 pt-8">
              <Gallery
                images={formData.gallery || []}
                onAddImage={onAddImage}
                onRemoveImage={onRemoveImage}
              />
            </div>
          </div>

          <div className={cardClass}>
            <ActivityFeed events={activity} onClear={clearActivity} />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <dt className="col-span-1 text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </dt>
      <dd className="col-span-2 text-gray-900 dark:text-white font-semibold truncate">
        {children}
      </dd>
    </div>
  );
}

function CheckRow({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={clsx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-transparent bg-green-500 text-white"
            : "border-gray-300 text-gray-300 dark:border-gray-600"
        )}
      >
        {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      </div>
      <span
        className={clsx(
          "text-sm font-medium transition-colors",
          done ? "text-gray-900 dark:text-white" : "text-gray-500"
        )}
      >
        {children}
      </span>
    </li>
  );
}

function UsageBar({
  label,
  used,
  total,
  unit,
}: {
  label: string;
  used: number;
  total: number;
  unit?: string;
}) {
  const pct = Math.min(100, Math.round((used / Math.max(total, 1)) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-300 mb-1.5">
        <span>{label}</span>
        <span>
          {used} / {total} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${GRADIENT_BG}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function calcCompleteness(u: User): number {
  const checks = [
    !!u.phone,
    !!u.preferences?.timezone,
    !!u.connected?.google,
    !!u.security?.twoFactorEnabled,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
