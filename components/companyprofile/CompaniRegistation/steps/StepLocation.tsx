"use client";

import { Dispatch, SetStateAction } from "react";
import { inputBase, labelBase } from "../ui/classes";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  formData: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    servicedPorts?: string;
    lat: number;
    lng: number;
    pinUrl?: string;
  };
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<any>>;
  countryList: [string, string][];
  pin: File | null;
};

function MarkerSetter({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function StepLocation({
  formData,
  errors,
  setFormData,
  countryList,
  pin,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelBase}>Country</label>
          <select
            className={inputBase}
            value={formData.country || ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, country: e.target.value }))
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
            value={formData.state ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, state: e.target.value }))
            }
            placeholder="State/Province"
          />
        </div>
        <div>
          <label className={labelBase}>City</label>
          <input
            className={inputBase}
            value={formData.city ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, city: e.target.value }))
            }
            placeholder="City"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelBase}>Address *</label>
          <input
            className={`${inputBase} ${errors.address ? "border-red-500" : ""}`}
            value={formData.address ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, address: e.target.value }))
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
            value={formData.postalCode ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, postalCode: e.target.value }))
            }
            placeholder="Postal Code"
          />
        </div>

        <div>
          <label className={labelBase}>Serviced Ports (up to 1)</label>
          <input
            className={inputBase}
            value={formData.servicedPorts ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, servicedPorts: e.target.value }))
            }
            placeholder="e.g. Port of Constanța"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="w-full h-72 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
          <MapContainer
            center={[formData.lat, formData.lng]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[formData.lat, formData.lng]}
              icon={L.icon({
                iconUrl: pin
                  ? URL.createObjectURL(pin)
                  : formData.pinUrl || "/marker-icon.png",
                iconSize: [35, 35],
                iconAnchor: [17, 34],
              })}
            />
            <MarkerSetter
              onPick={(lat, lng) =>
                setFormData((p: any) => ({ ...p, lat, lng }))
              }
            />
          </MapContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          Tip: click on the map to set the pin.
        </div>
      </div>
    </>
  );
}
