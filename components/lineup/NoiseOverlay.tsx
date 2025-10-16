export default function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-soft-light"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "4px 4px",
      }}
    />
  );
}
