/** Map point limits shared by the form, the logo resizer and the demo backend (same values as the API) */

/** Title (firstName) length, backend MAP_POINT_TITLE_MAX_LENGTH */
export const TITLE_MAX = 120;

/** Logo data URL length in characters, backend MAP_POINT_LOGO_MAX_LENGTH */
export const LOGO_MAX_CHARS = 150_000;

/** Logo side the browser resizes to before upload */
export const LOGO_MAX_PX = 256;

/** Image types the API stores for a logo */
export const LOGO_MIME_TYPES = ["image/webp", "image/png", "image/jpeg"] as const;
