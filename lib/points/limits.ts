/** Map point limits shared by the form, the logo resizer and the demo backend (same values as the API) */

/** Title (firstName) length, backend MAP_POINT_TITLE_MAX_LENGTH */
export const TITLE_MAX = 120;

/** Logo data URL length in characters, backend MAP_POINT_LOGO_MAX_LENGTH */
export const LOGO_MAX_CHARS = 150_000;

/** Logo side the browser resizes to before upload */
export const LOGO_MAX_PX = 256;

/** Image types the API stores for a logo */
export const LOGO_MIME_TYPES = ["image/webp", "image/png", "image/jpeg"] as const;

/** Points a client (viewer) may own, backend CLIENT_POINT_LIMIT; the team has no limit */
export const CLIENT_POINT_LIMIT = 5;

/** Business Activity slots of a point: one comes free, more are bought from the balance (backend max) */
export const MAX_ACTIVITY_SLOTS = 14;

/** Company description and website, backend map_point limits */
export const DESCRIPTION_MAX = 2000;
export const WEBSITE_MAX = 255;
