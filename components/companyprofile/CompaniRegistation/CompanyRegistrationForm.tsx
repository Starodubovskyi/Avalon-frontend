"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Company } from "@/components/types/company.types";

countries.registerLocale(enLocale);

const BUSINESS_ACTIVITIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Hospitality",
  "Automotive",
  "Food & Beverage",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Media",
  "Transportation",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Pharmaceuticals",
  "Entertainment",
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function CompanyRegistrationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Company) => void;
  initialData?: Company;
}) {
  const countryList = useMemo(
    () => Object.entries(countries.getNames("en")),
    []
  );

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Company>(
    initialData || {
      legalName: "",
      businessName: "",
      employees: "",
      founded: "",
      lat: 51.505,
      lng: -0.09,
      logoUrl: "",
      bannerUrl: "",
      pinUrl: "",
      activity: "",
      country: "",
      city: "",
      servicedPorts: "",
      address: "",
      state: "",
      postalCode: "",
      telephone: "",
      fax: "",
      email: "",
      website: "",
      poBox: "",
      tagline: "",
      description: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [pin, setPin] = useState<File | null>(null);

  useEffect(() => {
    setLogo(null);
    setBanner(null);
    setPin(null);
  }, [initialData]);

  const inputBase =
    "w-full mt-2 rounded-xl border bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-200 dark:border-neutral-700 text-sm";
  const labelBase =
    "block text-[13px] font-medium text-gray-700 dark:text-neutral-200";
  const section =
    "rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow-[0_8px_30px_rgba(2,6,23,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.06)] p-4 sm:p-6";
  const chip =
    "inline-flex items-center rounded-full border border-blue-200/80 dark:border-blue-900/50 px-2.5 py-1 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/30";

  const MarkerSetter = () => {
    useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }));
      },
    });
    return null;
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => res(reader.result as string);
      reader.onerror = (e) => rej(e);
    });

  const validate = () => {
    const v: Record<string, string> = {};
    if (!formData.legalName) v.legalName = "Legal Name is required";
    if (!formData.businessName) v.businessName = "Business Name is required";
    if (!formData.address) v.address = "Address is required";
    if (!formData.email) v.email = "Email is required";
    if (!formData.website) v.website = "Website is required";
    if (!formData.activity) v.activity = "Activity is required";
    if (!formData.description) v.description = "Description is required";
    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const finalLogoUrl = logo ? await toBase64(logo) : formData.logoUrl || "";
      const finalBannerUrl = banner
        ? await toBase64(banner)
        : formData.bannerUrl || "";
      const finalPinUrl = pin ? await toBase64(pin) : formData.pinUrl || "";

      onSubmit({
        ...(formData as Company),
        logoUrl: finalLogoUrl,
        bannerUrl: finalBannerUrl,
        pinUrl: finalPinUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const Progress = () => {
    const steps: { id: Step; label: string }[] = [
      { id: 1, label: "Company" },
      { id: 2, label: "Branding" },
      { id: 3, label: "Location" },
      { id: 4, label: "Contacts" },
      { id: 5, label: "About" },
    ];
    const percent =
      (steps.findIndex((s) => s.id === step) / (steps.length - 1)) * 100;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-neutral-400">
          {steps.map((s) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div
                className={`rounded-full h-7 px-3 flex items-center justify-center ${
                  step === s.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
                }`}
              >
                {s.label}
              </div>
              {s.id !== 5 && (
                <div className="h-[2px] flex-1 bg-gray-200 dark:bg-neutral-700" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  const StickyNav = () => (
    <div className="sticky bottom-0 left-0 right-0 z-10 mt-6">
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-3 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-neutral-400">
          Step {step} of 5
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              Back
            </button>
          )}
          {step < 5 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition"
            >
              Next
            </button>
          )}
          {step === 5 && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition disabled:opacity-60"
            >
              {initialData ? "Update Company" : "Save Company"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[100dvh] max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        {initialData ? "Edit Company Profile" : "Register Company"}
      </h2>
      <p className="text-sm text-gray-600 dark:text-neutral-300">
        Welcome to the Avalon Business Directory. Please provide your details.
        The more complete your profile is, the more visibility it will get.
      </p>

      <Progress />

      {step === 1 && (
        <div className={section}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelBase}>Legal Company Name *</label>
              <input
                className={`${inputBase} ${
                  errors.legalName ? "border-red-500" : ""
                }`}
                value={formData.legalName}
                onChange={(e) =>
                  setFormData({ ...formData, legalName: e.target.value })
                }
                placeholder="Legal Name"
              />
              {errors.legalName && (
                <p className="mt-1 text-xs text-red-500">{errors.legalName}</p>
              )}
            </div>
            <div>
              <label className={labelBase}>Business Name (Trading as) *</label>
              <input
                className={`${inputBase} ${
                  errors.businessName ? "border-red-500" : ""
                }`}
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="Business Name"
              />
              {errors.businessName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.businessName}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Main Business Activity *</label>
              <select
                className={`${inputBase} ${
                  errors.activity ? "border-red-500" : ""
                }`}
                value={formData.activity || ""}
                onChange={(e) =>
                  setFormData({ ...formData, activity: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Business Activity
                </option>
                {BUSINESS_ACTIVITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {errors.activity && (
                <p className="mt-1 text-xs text-red-500">{errors.activity}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Number of Employees</label>
              <input
                className={inputBase}
                value={formData.employees}
                onChange={(e) =>
                  setFormData({ ...formData, employees: e.target.value })
                }
                placeholder="e.g. 20–50"
              />
            </div>

            <div>
              <label className={labelBase}>Founded (Year)</label>
              <input
                className={inputBase}
                value={formData.founded}
                onChange={(e) =>
                  setFormData({ ...formData, founded: e.target.value })
                }
                placeholder="e.g. 2016"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={section}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Logo */}
            <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
              <div className="flex items-center justify-between">
                <span className={labelBase}>Company Logo</span>
                <span className={chip}>Square</span>
              </div>
              <div className="mt-3">
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setLogo(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="logoUpload"
                  className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
                >
                  Click to upload or drag & drop
                </label>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                  JPG/PNG, min 300×250, max 512kb
                </div>
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
                  {logo ? (
                    <img
                      src={URL.createObjectURL(logo)}
                      className="w-full h-40 object-contain"
                      alt="Logo preview"
                    />
                  ) : formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      className="w-full h-40 object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <div className="h-40 grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Remove selected
                  </button>
                )}
              </div>
            </div>

            <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
              <div className="flex items-center justify-between">
                <span className={labelBase}>Company Banner</span>
                <span className={chip}>Wide</span>
              </div>
              <div className="mt-3">
                <input
                  id="bannerUpload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="bannerUpload"
                  className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
                >
                  Click to upload or drag & drop
                </label>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                  JPG/PNG, min 234×60, max 512kb
                </div>
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
                  {banner ? (
                    <img
                      src={URL.createObjectURL(banner)}
                      className="w-full h-40 object-contain"
                      alt="Banner preview"
                    />
                  ) : formData.bannerUrl ? (
                    <img
                      src={formData.bannerUrl}
                      className="w-full h-40 object-contain"
                      alt="Banner"
                    />
                  ) : (
                    <div className="h-40 grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                {banner && (
                  <button
                    type="button"
                    onClick={() => setBanner(null)}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Remove selected
                  </button>
                )}
              </div>
            </div>

            {/* Pin */}
            <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
              <div className="flex items-center justify-between">
                <span className={labelBase}>Company Pin</span>
                <span className={chip}>Small</span>
              </div>
              <div className="mt-3">
                <input
                  id="pinUpload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setPin(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="pinUpload"
                  className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
                >
                  Click to upload or drag & drop
                </label>
                <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                  JPG/PNG, min 42×42, max 512kb
                </div>
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
                  {pin ? (
                    <img
                      src={URL.createObjectURL(pin)}
                      className="w-full h-40 object-contain"
                      alt="Pin preview"
                    />
                  ) : formData.pinUrl ? (
                    <img
                      src={formData.pinUrl}
                      className="w-full h-40 object-contain"
                      alt="Pin"
                    />
                  ) : (
                    <div className="h-40 grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                {pin && (
                  <button
                    type="button"
                    onClick={() => setPin(null)}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Remove selected
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={section}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelBase}>Country</label>
              <select
                className={inputBase}
                value={formData.country || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Country
                </option>
                {countryList.map(([code, name]) => (
                  <option key={code} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>State/Province</label>
              <input
                className={inputBase}
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="State/Province"
              />
            </div>
            <div>
              <label className={labelBase}>City</label>
              <input
                className={inputBase}
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelBase}>Address *</label>
              <input
                className={`${inputBase} ${
                  errors.address ? "border-red-500" : ""
                }`}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street, building, office"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Postal Code</label>
              <input
                className={inputBase}
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder="Postal Code"
              />
            </div>

            <div>
              <label className={labelBase}>Serviced Ports (up to 1)</label>
              <input
                className={inputBase}
                value={formData.servicedPorts}
                onChange={(e) =>
                  setFormData({ ...formData, servicedPorts: e.target.value })
                }
                placeholder="e.g. Port of Constanța"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full h-72 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
              <MapContainer
                center={[formData.lat!, formData.lng!]}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[formData.lat!, formData.lng!]}
                  icon={L.icon({
                    iconUrl: pin
                      ? URL.createObjectURL(pin)
                      : formData.pinUrl || "/marker-icon.png",
                    iconSize: [35, 35],
                    iconAnchor: [17, 34],
                  })}
                />
                <MarkerSetter />
              </MapContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              Tip: click on the map to set the pin.
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={section}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelBase}>Company Email *</label>
              <input
                className={`${inputBase} ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className={labelBase}>Website *</label>
              <input
                className={`${inputBase} ${
                  errors.website ? "border-red-500" : ""
                }`}
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://company.com"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-500">{errors.website}</p>
              )}
            </div>
            <div>
              <label className={labelBase}>Telephone</label>
              <input
                className={inputBase}
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                placeholder="+40..."
              />
            </div>
            <div>
              <label className={labelBase}>Fax</label>
              <input
                className={inputBase}
                value={formData.fax}
                onChange={(e) =>
                  setFormData({ ...formData, fax: e.target.value })
                }
                placeholder="+40..."
              />
            </div>
            <div>
              <label className={labelBase}>P.O. Box</label>
              <input
                className={inputBase}
                value={formData.poBox}
                onChange={(e) =>
                  setFormData({ ...formData, poBox: e.target.value })
                }
                placeholder="P.O. Box"
              />
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className={section}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelBase}>Tagline</label>
              <input
                className={inputBase}
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="Short company tagline"
              />
            </div>
            <div>
              <label className={labelBase}>Company Description *</label>
              <div className="relative">
                <textarea
                  className={`${inputBase} h-48 resize-none`}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell about your services, fleet, certifications (200–500 chars recommended)"
                />
                <div className="absolute bottom-2 right-3 text-[11px] text-gray-500 dark:text-neutral-400">
                  {formData.description?.length || 0} / 500
                </div>
              </div>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
            <label className="flex items-start gap-2 text-[13px] text-gray-700 dark:text-neutral-300">
              <input type="checkbox" className="mt-0.5" required />
              <span>
                I am authorised to create an account for the above company. My
                registered email address matches the official domain name of the
                registered company.
              </span>
            </label>
          </div>
        </div>
      )}

      <StickyNav />
    </form>
  );
}
