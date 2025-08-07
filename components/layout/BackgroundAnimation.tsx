// @/components/layout/BackgroundAnimation.tsx
"use client";

const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="w-full h-full object-cover"
        style={{ filter: "brightness(0.5) contrast(1.2)" }}
      >
        {/* Замените на путь к вашему видео */}
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default BackgroundAnimation;
