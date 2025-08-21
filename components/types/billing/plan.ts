// lib/billing/plans.ts
import { Ship, Compass, Radar, Crown, type LucideIcon } from "lucide-react";

export type Billing = "monthly" | "yearly";
export type Feature = { label: string; included: boolean };

export type Plan = {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;              
  monthly: number;
  yearly: number;
  highlight?: boolean;
  features: Feature[];
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Start tracking vessels with essentials",
    icon: Ship,
    monthly: 0,
    yearly: 0,
    features: [
      { label: "Live vessel map (5 min delay)", included: true },
      { label: "Search by IMO/MMSI/Name", included: true },
      { label: "10 vessel watchlist", included: true },
      { label: "Port arrivals & departures (last 24h)", included: true },
      { label: "Basic route history (24h)", included: true },
      { label: "Email alerts (up to 3 rules)", included: true },
      { label: "Weather overlay (basic wind)", included: false },
      { label: "CSV export", included: false },
      { label: "Geofencing zones", included: false },
      { label: "Satellite AIS positions", included: false },
      { label: "Multi-user seats", included: false },
    ],
  },
  {
    id: "navigator",
    name: "Navigator",
    tagline: "Deeper visibility for individuals",
    icon: Compass,
    monthly: 19,
    yearly: 190,
    features: [
      { label: "Live vessel map (near real-time)", included: true },
      { label: "Advanced filters & saved searches", included: true },
      { label: "100 vessel watchlist", included: true },
      { label: "Port calls & schedule insights", included: true },
      { label: "Route history (7 days)", included: true },
      { label: "Email & push alerts (20 rules)", included: true },
      { label: "Weather overlay (wind, waves)", included: true },
      { label: "CSV export", included: true },
      { label: "Geofencing zones", included: false },
      { label: "Satellite AIS positions", included: false },
      { label: "Multi-user seats", included: false },
    ],
  },
  {
    id: "fleet-pro",
    name: "Fleet Pro",
    tagline: "Operational tools for teams",
    icon: Radar,
    monthly: 49,
    yearly: 490,
    highlight: true,
    features: [
      { label: "Live vessel map (near real-time)", included: true },
      { label: "Advanced filters & saved searches", included: true },
      { label: "Unlimited vessel watchlist", included: true },
      { label: "Port calls, ETAs, turnaround analytics", included: true },
      { label: "Route history (90 days)", included: true },
      { label: "Email & push alerts (100 rules)", included: true },
      { label: "Weather overlays (wind, waves, currents)", included: true },
      { label: "CSV/Excel export & scheduled reports", included: true },
      { label: "Geofencing zones & breach alerts", included: true },
      { label: "Satellite AIS add-on (pay-as-you-go)", included: true },
      { label: "Multi-user seats (up to 5)", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Maritime Enterprise",
    tagline: "Full-scale maritime monitoring",
    icon: Crown,
    monthly: 129,
    yearly: 1290,
    features: [
      { label: "Live vessel map (priority updates)", included: true },
      { label: "Custom dashboards & analytics", included: true },
      { label: "Unlimited watchlists & geofences", included: true },
      { label: "Full route history (365 days+)", included: true },
      { label: "Enterprise alerts & notifications", included: true },
      { label: "Premium weather layers", included: true },
      { label: "Bulk exports & scheduled reports", included: true },
      { label: "Satellite AIS included", included: true },
      { label: "Multi-user seats (unlimited)", included: true },
      { label: "Dedicated account manager", included: true },
    ],
  },
];

export function getPlanById(id: string | null) {
  if (!id) return null;
  return PLANS.find((p) => p.id === id) ?? null;
}
