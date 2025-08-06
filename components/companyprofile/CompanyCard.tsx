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
    <div className="space-y-6 w-full h-full px-4">
      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {company.bannerUrl ? (
          <img
            src={company.bannerUrl}
            alt="Company Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600"></div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex items-center justify-center">
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {company.businessName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {company.activity}
          </p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-white">
          About Company
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {company.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <div className="space-y-2">
          <p>
            <strong>Legal Name:</strong> {company.legalName}
          </p>
          <p>
            <strong>Founded:</strong> {company.founded}
          </p>
          <p>
            <strong>Employees:</strong> {company.employees}
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              {company.website}
            </a>
          </p>
          <p>
            <strong>Email:</strong> {company.email}
          </p>
          <p>
            <strong>Tagline:</strong> {company.tagline}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Country:</strong> {company.country}
          </p>
          <p>
            <strong>City:</strong> {company.city}
          </p>
          <p>
            <strong>Address:</strong> {company.address}
          </p>
          <p>
            <strong>Postal Code:</strong> {company.postalCode}
          </p>
          <p>
            <strong>Serviced Ports:</strong> {company.servicedPorts}
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg w-full h-[300px]">
        <MapContainer
          center={[company.lat, company.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[company.lat, company.lng]}>
            <Popup>{company.businessName}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
