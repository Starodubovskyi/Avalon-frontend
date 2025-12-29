import React, { useRef, useState } from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

interface GalleryProps {
  images: string[];
  onAddImage: (file: File) => void;
  onRemoveImage: (index: number) => void;
}

export default function Gallery({
  images,
  onAddImage,
  onRemoveImage,
}: GalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddImage(file);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-500" /> Gallery
          </h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors"
            type="button"
          >
            <Plus size={14} /> Add Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-6 flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon size={24} className="opacity-50" />
            <span className="text-sm">No images uploaded yet</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(i);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
        >
          <img
            src={images[lightboxIndex]}
            alt="Lightbox"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={32} />
          </button>
        </div>
      )}
    </>
  );
}
