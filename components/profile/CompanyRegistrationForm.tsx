"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type Company = {
  legalName: string;
  businessName: string;
  activity: string;
  founded: string;
  employees: string;
  description: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  telephone?: string;
  fax?: string;
  website: string;
  poBox?: string;
  logoUrl: string;
  bannerUrl: string;
  pinUrl: string;
  lat: number;
  lng: number;
};

export default function CompanyRegistrationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Company) => void;
  initialData?: Company;
}) {
  const [formData, setFormData] = useState<Partial<Company>>(
    initialData || {
      employees: "",
      founded: "",
      lat: 51.505,
      lng: -0.09,
    }
  );

  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [pin, setPin] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

    if (
      !formData.legalName ||
      !formData.businessName ||
      !formData.activity ||
      !formData.description ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.country ||
      !formData.website
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const toBase64 = (file: File): Promise<string> =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => res(reader.result as string);
        reader.onerror = (e) => rej(e);
      });

    const logoUrl = logo ? await toBase64(logo) : formData.logoUrl!;
    const bannerUrl = banner ? await toBase64(banner) : formData.bannerUrl!;
    const pinUrl = pin ? await toBase64(pin) : formData.pinUrl!;

    onSubmit({
      ...(formData as Company),
      logoUrl,
      bannerUrl,
      pinUrl,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow space-y-4"
    >
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {initialData ? "Edit Company Profile" : "Register Company"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          defaultValue={formData.legalName}
          placeholder="Legal Company Name *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, legalName: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.businessName}
          placeholder="Business Name *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, businessName: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.activity}
          placeholder="Main Business Activity *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, activity: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.employees}
          placeholder="Number of Employees *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, employees: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.founded}
          placeholder="Founded *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, founded: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.email}
          placeholder="Email *"
          className="input"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          required
          defaultValue={formData.website}
          placeholder="Website *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
        <input
          defaultValue={formData.telephone}
          placeholder="Phone"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, telephone: e.target.value })
          }
        />
      </div>

      <textarea
        required
        defaultValue={formData.description}
        placeholder="Company Description *"
        rows={4}
        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      ></textarea>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          defaultValue={formData.address}
          placeholder="Address *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.city}
          placeholder="City *"
          className="input"
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
        <input
          required
          defaultValue={formData.country}
          placeholder="Country *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
        />
        <input
          required
          defaultValue={formData.postalCode}
          placeholder="Postal Code *"
          className="input"
          onChange={(e) =>
            setFormData({ ...formData, postalCode: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setLogo(e.target.files[0])}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setBanner(e.target.files[0])}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setPin(e.target.files[0])}
        />
      </div>

      <div className="h-60 mt-4">
        <MapContainer
          center={[formData.lat!, formData.lng!]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full rounded-xl z-0"
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

      <button
        type="submit"
        className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
      >
        {initialData ? "Update Company" : "Save Company"}
      </button>
    </form>
  );
}
