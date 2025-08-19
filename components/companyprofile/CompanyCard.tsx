import { FaShip } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Company } from "@/components/types/company.types";

const DefaultIcon = L.icon({
  iconUrl: typeof icon === "string" ? icon : icon.src,
  shadowUrl: typeof iconShadow === "string" ? iconShadow : iconShadow.src,
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="w-full space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="h-48 w-full bg-gray-100 dark:bg-black">
          {company.bannerUrl ? (
            <img
              src={company.bannerUrl}
              alt="Company Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-black bg-white dark:bg-black overflow-hidden flex items-center justify-center shadow">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaShip className="text-3xl text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="text-white drop-shadow">
              <h2 className="text-2xl font-bold">{company.businessName}</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                {company.activity && (
                  <span className="inline-flex items-center rounded-full bg-white/90 text-gray-800 px-2.5 py-0.5 text-xs">
                    {company.activity}
                  </span>
                )}
                {company.tagline && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/90 text-white px-2.5 py-0.5 text-xs">
                    {company.tagline}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-white/90 text-gray-800 px-3 py-2 text-xs font-medium hover:bg-white transition"
              >
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Overview + Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-2">About Company</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {company.description || "No description provided."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700 dark:text-gray-300">
              <InfoRow label="Legal Name" value={company.legalName} />
              <InfoRow label="Founded" value={company.founded} />
              <InfoRow label="Employees" value={company.employees} />
              <InfoRow
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    ""
                  )
                }
              />
              <InfoRow label="Email" value={company.email} />
              <InfoRow label="Serviced Ports" value={company.servicedPorts} />
              <InfoRow label="Tagline" value={company.tagline} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 shadow p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3">Headquarters</h3>
            <div className="text-xs text-gray-500 dark:text-neutral-400 mb-2">
              {company.address}
              {company.city ? `, ${company.city}` : ""}{" "}
              {company.country ? `• ${company.country}` : ""}
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 w-full h-[260px]">
              <MapContainer
                center={[company.lat, company.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[company.lat, company.lng]}>
                  <Popup>{company.businessName}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-40 shrink-0 text-gray-500 dark:text-neutral-400">
        {label}:
      </div>
      <div className="flex-1">
        {value || <span className="opacity-60">—</span>}
      </div>
    </div>
  );
}
