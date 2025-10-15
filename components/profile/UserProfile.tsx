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
  FaGoogle,
  FaLock,
  FaSignOutAlt,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import imageCompression from "browser-image-compression";
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

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames("en"));

const SUPPORTED_TZS: string[] =
  typeof (Intl as any).supportedValuesOf === "function"
    ? (Intl as any).supportedValuesOf("timeZone")
    : [
        "UTC",
        "Europe/Bucharest",
        "Europe/Kyiv",
        "Europe/London",
        "Europe/Berlin",
      ];

type Membership = {
  plan: "Basic" | "Pro" | "Business" | string;
};

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
    const changed: string[] = [];
    if (user?.name !== next.name || user?.lastName !== next.lastName)
      changed.push("name");
    if (user?.bio !== next.bio) changed.push("bio");
    if (user?.phone !== next.phone) changed.push("phone");
    if (JSON.stringify(user?.preferences) !== JSON.stringify(next.preferences))
      changed.push("preferences");
    if (JSON.stringify(user?.links || []) !== JSON.stringify(next.links || []))
      changed.push("links");
    if (JSON.stringify(user?.tags || []) !== JSON.stringify(next.tags || []))
      changed.push("tags");

    persistUser(next);
    setEditMode(false);
    if (changed.length) {
      pushActivity({
        type: "profile",
        title: "Updated profile",
        meta: `Changed: ${changed.join(", ")}`,
      });
    }
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
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
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
    pushActivity({
      type: "files",
      title: "Uploaded image",
      meta: `Gallery total: ${newGallery.length}`,
    });
  };

  const onRemoveImage = (idx: number) => {
    const newGallery = (formData.gallery || []).filter((_, i) => i !== idx);
    persistUser({ ...formData, gallery: newGallery });
    pushActivity({
      type: "files",
      title: "Removed image",
      meta: `Gallery total: ${newGallery.length}`,
    });
  };

  const onLogout = () => {
    pushActivity({ type: "security", title: "Signed out" });
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/");
  };

  const toggleTask = (id: string) => {
    const prev = tasks.find((t) => t.id === id);
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    localStorage.setItem(tasksKey, JSON.stringify(next));
    if (prev) {
      pushActivity({
        type: "task",
        title: `${prev.done ? "Reopened task" : "Completed task"}`,
        meta: prev.title,
      });
    }
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

  const card =
    "rounded-3xl border border-gray-200/70 bg-white/95 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-sm " +
    "dark:bg-neutral-900/70 dark:border-white/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-sm bg-white border-gray-300 text-gray-900 " +
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

          {formData.verified && showCongrats && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm
                         dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200"
            >
              <div className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">
                    Поздравляем! Верификация завершена 🎉
                  </div>
                  <div className="opacity-90">
                    Вы заполнили все ключевые шаги профиля.
                  </div>
                </div>
                <button
                  onClick={() => setShowCongrats(false)}
                  className="rounded-md px-2 py-1 text-xs hover:bg-green-100/60 dark:hover:bg-green-900/40"
                  type="button"
                  aria-label="Dismiss"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {!formData.verified && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Profile
              </h3>
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {completeness}% complete
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <CheckRow done={!!formData.phone}>Add phone</CheckRow>
                  <CheckRow done={!!formData.preferences?.timezone}>
                    Set timezone
                  </CheckRow>
                  <CheckRow done={!!formData.connected?.google}>
                    Connect Google
                    {!formData.connected?.google && (
                      <button
                        onClick={connectGoogle}
                        className="ml-2 inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        type="button"
                      >
                        <FaGoogle /> Connect
                      </button>
                    )}
                  </CheckRow>
                  <CheckRow done={!!formData.security?.twoFactorEnabled}>
                    Enable 2FA
                  </CheckRow>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Contact & Preferences
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
                    className="text-blue-700 dark:text-blue-400 hover:underline"
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
                    className={inputBase}
                  >
                    <option value="">Select timezone</option>
                    {SUPPORTED_TZS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                ) : (
                  formData.preferences?.timezone || "—"
                )}
              </Row>

              <Row label="Working hours">
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
                    <span className="text-gray-500 dark:text-gray-400">–</span>
                    <input
                      type="time"
                      value={formData.preferences?.workingHours?.to || "17:00"}
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
                  `${formData.preferences.workingHours.from}–${formData.preferences.workingHours.to}`
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
                  formData.preferences?.country || "—"
                )}
              </Row>

              <Row label="Units / Time / Currency">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={formData.preferences?.units || "metric"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences!,
                            units: e.target.value as any,
                          },
                        })
                      }
                      className={inputBase}
                    >
                      <option value="metric">Metric</option>
                      <option value="imperial">Imperial</option>
                    </select>
                    <select
                      value={formData.preferences?.timeFormat || "24h"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences!,
                            timeFormat: e.target.value as any,
                          },
                        })
                      }
                      className={inputBase}
                    >
                      <option value="24h">24h</option>
                      <option value="12h">12h</option>
                    </select>
                    <select
                      value={formData.preferences?.currency || "USD"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences!,
                            currency: e.target.value as any,
                          },
                        })
                      }
                      className={inputBase}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                ) : (
                  `${formData.preferences?.units?.toUpperCase()} • ${formData.preferences?.timeFormat?.toUpperCase()} • ${
                    formData.preferences?.currency
                  }`
                )}
              </Row>
            </dl>
          </div>

          {company?.businessName && (
            <a
              href="/companyprofile"
              className={
                "mt-6 block rounded-2xl border border-gray-200/70 bg-white/95 p-4 transition hover:shadow-[0_8px_24px_rgba(2,6,23,0.08)] dark:bg-neutral-900/60 dark:border-white/10"
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

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Security
            </h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FaLock className="text-gray-500" />
                  <span>Two-Factor Authentication</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.security?.twoFactorEnabled}
                    onChange={toggle2FA}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="rounded-xl border border-gray-200/70 p-3 dark:border-white/10">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Active sessions
                </div>
                <ul className="space-y-2">
                  {(formData.security?.sessions || seedSessions()).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        {s.device} • {s.location || "—"}
                        {s.current && (
                          <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            current
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(s.lastSeen).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={signOutAll}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5"
                  type="button"
                >
                  <FaSignOutAlt /> Sign out of other devices
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200/70 dark:border.white/10">
            <div className="p-4 bg-white/95 dark:bg-neutral-900/60">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Plan & Usage
              </h3>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="opacity-80">Current plan:</span>
                <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {(
                    subscription?.planName ||
                    formData.membership?.plan ||
                    "Basic"
                  )
                    .toString()
                    .toUpperCase()}
                </span>
                {subscription && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg.white/10 dark:text-gray-200">
                    {subscription.billing === "monthly" ? "MONTHLY" : "YEARLY"}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <UsageRow
                  label="Seats used"
                  value={formData.usage!.seatsUsed}
                  total={formData.usage!.seatsTotal}
                />
                <UsageRow
                  label="Storage used"
                  value={formData.usage!.storageUsedGB}
                  total={formData.usage!.storageTotalGB}
                  suffix="GB"
                />
                <UsageRow
                  label="API credits"
                  value={formData.usage!.apiUsed}
                  total={formData.usage!.apiLimit}
                />
                <UsageRow
                  label="Watchlist items"
                  value={formData.usage!.watchlistUsed}
                  total={formData.usage!.watchlistLimit}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex gap-2 dark:bg-white/5">
              {subscription ? (
                <button
                  type="button"
                  onClick={() => router.push("/billing")}
                  className="w-full rounded-full bg-gray-900 py-2 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-[.98] transition dark:bg-white dark:text-black"
                >
                  Manage in Billing
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goUpgrade}
                  className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 py-2 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-[.98] transition dark:from-blue-500 dark:to-indigo-600"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <section className="col-span-2 space-y-6">
        <div className={card + " p-5"}>
          <AlertsCenter userEmail={formData.email} />
        </div>

        <div className={card + " p-5"}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Pinned Files & Links
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
                No links yet — add some in Edit mode.
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
            Account Activity
          </h3>
          <ActivityFeed events={activity} onClear={clearActivity} />
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

function CheckRow({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={[
          "inline-flex h-5 w-5 items-center justify-center rounded-full border",
          done
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 text-gray-400",
        ].join(" ")}
      >
        {done ? <FaCheckCircle /> : <FaRegCircle />}
      </span>
      <span className="text-gray-800 dark:text-gray-200 text-sm">
        {children}
      </span>
    </li>
  );
}

function UsageRow({
  label,
  value,
  total,
  suffix,
}: {
  label: string;
  value: number;
  total: number;
  suffix?: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(total, 1)) * 100));
  const meter = `${value}${suffix ? " " + suffix : ""} / ${total}${
    suffix ? " " + suffix : ""
  }`;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        <span>{meter}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500"
          style={{ width: `${pct}%` }}
        />
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
