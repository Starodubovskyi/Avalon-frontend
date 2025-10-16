"use client";

export default function Avatar({
  name,
  src,
  size = 24,
  className = "",
}: {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const initials =
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.4) }}
      title={name}
    >
      {initials}
    </div>
  );
}
