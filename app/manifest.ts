import type { MetadataRoute } from "next";

/** Installable on phones: opens full-screen on the vessels overview */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avalon Shipping — Operations",
    short_name: "Avalon Ops",
    description: "Vessels in work, Sulina line-up, checklist, chat and documents for the Avalon team.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f7fb",
    theme_color: "#0f2a5c",
    icons: [
      { src: "/brand/avalon-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/avalon-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
