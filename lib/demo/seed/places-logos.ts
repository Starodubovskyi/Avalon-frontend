/** Invented company marks for demo points, as SVG data URLs (the real API stores 256 px webp/png/jpeg) */

function svgUrl(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DEMO_LOGOS = {
  avalon: svgUrl(
    `<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b74d6"/><stop offset="1" stop-color="#0f1f4d"/></linearGradient></defs>` +
      `<rect width="128" height="128" rx="30" fill="url(#a)"/>` +
      `<path d="M64 22 96 92H81L64 53 47 92H32Z" fill="#fff"/>` +
      `<path d="M24 104q10-8 20 0t20 0 20 0 20 0" fill="none" stroke="#8fd0ff" stroke-width="6" stroke-linecap="round"/>`,
  ),
  grain: svgUrl(
    `<circle cx="64" cy="64" r="62" fill="#14532d"/><circle cx="64" cy="64" r="54" fill="none" stroke="#facc15" stroke-opacity=".35" stroke-width="2"/>` +
      `<path d="M64 46v62" stroke="#facc15" stroke-width="5" stroke-linecap="round"/>` +
      `<g fill="#facc15"><ellipse cx="64" cy="34" rx="7" ry="13"/>` +
      `<ellipse cx="54" cy="56" rx="6.5" ry="12" transform="rotate(-32 54 56)"/><ellipse cx="74" cy="56" rx="6.5" ry="12" transform="rotate(32 74 56)"/>` +
      `<ellipse cx="54" cy="75" rx="6.5" ry="12" transform="rotate(-32 54 75)"/><ellipse cx="74" cy="75" rx="6.5" ry="12" transform="rotate(32 74 75)"/>` +
      `<ellipse cx="55" cy="93" rx="6" ry="11" transform="rotate(-32 55 93)"/><ellipse cx="73" cy="93" rx="6" ry="11" transform="rotate(32 73 93)"/></g>`,
  ),
  bessarabia: svgUrl(
    `<circle cx="64" cy="64" r="62" fill="#0c4a6e"/><circle cx="64" cy="64" r="53" fill="none" stroke="#38bdf8" stroke-width="4"/>` +
      `<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">` +
      `<circle cx="64" cy="33" r="8"/><path d="M64 41v59M47 54h34M33 76c4 16 16 24 31 24s27-8 31-24"/></g>`,
  ),
  delta: svgUrl(
    `<defs><linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#c2410c"/></linearGradient></defs>` +
      `<rect width="128" height="128" rx="64" fill="url(#d)"/>` +
      `<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round">` +
      `<path d="M26 50q9.5-9 19 0t19 0 19 0 19 0"/><path d="M26 68q9.5-9 19 0t19 0 19 0 19 0" stroke-opacity=".8"/><path d="M26 86q9.5-9 19 0t19 0 19 0 19 0" stroke-opacity=".55"/></g>`,
  ),
  pontic: svgUrl(
    `<defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs>` +
      `<rect width="128" height="128" rx="30" fill="#111827"/>` +
      `<path d="M64 18S32 58 32 80a32 32 0 0 0 64 0C96 58 64 18 64 18z" fill="url(#p)"/>` +
      `<path d="M49 82a15 15 0 0 0 15 15" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>`,
  ),
  reni: svgUrl(
    `<circle cx="64" cy="64" r="62" fill="#1d4ed8"/><circle cx="64" cy="64" r="44" fill="none" stroke="#93c5fd" stroke-opacity=".5" stroke-width="3"/>` +
      `<path d="M64 12 73 55 116 64 73 73 64 116 55 73 12 64 55 55Z" fill="#fff"/>` +
      `<path d="M64 12 73 55 64 64Z M116 64 73 73 64 64Z M64 116 55 73 64 64Z M12 64 55 55 64 64Z" fill="#bfdbfe"/>` +
      `<circle cx="64" cy="64" r="6" fill="#1d4ed8"/>`,
  ),
} as const;

export type DemoLogo = keyof typeof DEMO_LOGOS;
