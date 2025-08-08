import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Company } from "@/components/types/company.types";

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames("en"));

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

export default function CompanyRegistrationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Company) => void;
  initialData?: Company;
}) {
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [pin, setPin] = useState<File | null>(null);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationErrors: { [key: string]: string } = {};

    if (!formData.legalName)
      validationErrors.legalName = "Legal Name is required";
    if (!formData.businessName)
      validationErrors.businessName = "Business Name is required";
    if (!formData.website) validationErrors.website = "Website is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const toBase64 = (file: File): Promise<string> =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => res(reader.result as string);
        reader.onerror = (e) => rej(e);
      });

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-7xl mx-auto p-8 bg-transparent dark:bg-transparent rounded-none shadow-none space-y-6"
      >
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {initialData ? "Edit Company Profile" : "Register Company"}
        </h2>
        <strong>Welcome to the Avalon Business Directory.</strong>
        <p>
          Please, provide your company details in English. Remember: the more
          complete your profile is, the more visibility it will get.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Legal Company Name *
            </label>
            <input
              required
              value={formData.legalName}
              placeholder="Legal Company Name *"
              className={`input ${errors.legalName ? "border-red-500" : ""}`}
              onChange={(e) =>
                setFormData({ ...formData, legalName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name (Trading as) *
            </label>
            <input
              required
              value={formData.businessName}
              placeholder="Business Name *"
              className={`input ${errors.businessName ? "border-red-500" : ""}`}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Main Business Activity *
            </label>
            <select
              required
              value={formData.activity || ""}
              className="input"
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
            >
              <option value="" disabled>
                Select Business Activity
              </option>
              {BUSINESS_ACTIVITIES.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Employees
            </label>
            <input
              value={formData.employees}
              placeholder="Number of Employees"
              className="input"
              onChange={(e) =>
                setFormData({ ...formData, employees: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Founded (Year)
            </label>
            <input
              value={formData.founded}
              placeholder="Founded (Year)"
              className="input"
              onChange={(e) =>
                setFormData({ ...formData, founded: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Логотип */}
          <div className="border-2 border-dashed p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">
              Company Logo
            </label>
            <div className="mt-2 text-center">
              <input
                type="file"
                accept="image/jpeg, image/png"
                className="hidden"
                id="logoUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogo(file);
                }}
              />
              <label
                htmlFor="logoUpload"
                className="cursor-pointer text-blue-500"
              >
                Click to upload or drag and drop
              </label>
              <div className="text-xs text-gray-500">
                JPEG, JPG, PNG (min. 300x250px / max. 512kb)
              </div>

              {logo && (
                <div className="mt-4 relative">
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="Company Logo Preview"
                    className="w-full max-h-60 object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                    onClick={() => setLogo(null)} 
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Баннер */}
          <div className="border-2 border-dashed p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">
              Company Logo Banner
            </label>
            <div className="mt-2 text-center">
              <input
                type="file"
                accept="image/jpeg, image/png"
                className="hidden"
                id="bannerUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setBanner(file);
                }}
              />
              <label
                htmlFor="bannerUpload"
                className="cursor-pointer text-blue-500"
              >
                Click to upload or drag and drop
              </label>
              <div className="text-xs text-gray-500">
                JPEG, JPG, PNG (min. 234x60px / max. 512kb)
              </div>

              {banner && (
                <div className="mt-4 relative">
                  <img
                    src={URL.createObjectURL(banner)}
                    alt="Company Banner Preview"
                    className="w-full max-h-60 object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                    onClick={() => setBanner(null)} 
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-2 border-dashed p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">
              Company Logo Pin
            </label>
            <div className="mt-2 text-center">
              <input
                type="file"
                accept="image/jpeg, image/png"
                className="hidden"
                id="pinUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPin(file);
                }}
              />
              <label
                htmlFor="pinUpload"
                className="cursor-pointer text-blue-500"
              >
                Click to upload or drag and drop
              </label>
              <div className="text-xs text-gray-500">
                JPEG, JPG, PNG (min. 42x42px / max. 512kb)
              </div>

              {pin && (
                <div className="mt-4 relative">
                  <img
                    src={URL.createObjectURL(pin)}
                    alt="Company Pin Preview"
                    className="w-full max-h-60 object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                    onClick={() => setPin(null)} // Сбрасывает выбранный файл
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Activities (up to 3 items)
            </label>
            <input
              value={formData.activity}
              placeholder="Business Activities"
              className="input"
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Serviced Ports (up to 1)
            </label>
            <input
              value={formData.servicedPorts}
              placeholder="Serviced Ports"
              className="input"
              onChange={(e) =>
                setFormData({ ...formData, servicedPorts: e.target.value })
              }
            />
          </div>
        </div>

        <div className="h-72 mt-6">
          <MapContainer
            center={[formData.lat!, formData.lng!]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full rounded-xl"
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

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                required
                value={formData.address}
                placeholder="Address *"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                value={formData.city}
                placeholder="City"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                value={formData.country || ""}
                className="input"
                onChange={(e) => {
                  setFormData({ ...formData, country: e.target.value });
                }}
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
              <label className="block text-sm font-medium text-gray-700">
                State/Province
              </label>
              <input
                value={formData.state}
                placeholder="State/Province"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                value={formData.postalCode}
                placeholder="Postal Code"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telephone
              </label>
              <input
                value={formData.telephone}
                placeholder="Telephone"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fax
              </label>
              <input
                value={formData.fax}
                placeholder="Fax"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, fax: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Email *
              </label>
              <input
                required
                value={formData.email}
                placeholder="Company Email *"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                value={formData.website}
                placeholder="Website"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                P.O. Box
              </label>
              <input
                value={formData.poBox}
                placeholder="P.O. Box"
                className="input"
                onChange={(e) =>
                  setFormData({ ...formData, poBox: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Company Description *
          </label>
          <textarea
            value={formData.description}
            placeholder="Company Description"
            className="input w-full h-48"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Tagline
          </label>
          <input
            value={formData.tagline}
            placeholder="Tagline"
            className="input"
            onChange={(e) =>
              setFormData({ ...formData, tagline: e.target.value })
            }
          />
        </div>

        <div className="mt-6">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              required
              onChange={(e) =>
                setFormData({ ...formData, checkbox: e.target.checked })
              }
            />
            I am authorised to create an account for the above company. My
            registered email address matches the official domain name of the
            registered company.
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-6 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          {initialData ? "Update Company" : "Save Company"}
        </button>
      </form>
    </div>
  );
}
