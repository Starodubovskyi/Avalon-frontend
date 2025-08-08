import React, { useRef, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

interface GalleryProps {
  images: string[];
  onAddImage: (file: File) => void;
  onRemoveImage: (index: number) => void;
}

export default function Gallery({ images, onAddImage, onRemoveImage }: GalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddImage(file);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 bg-gradient-to-br from-white to-gray-50 dark:from-black/30 dark:to-black/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Files
          </h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center"
            type="button"
          >
            <FaPlus className="mr-1" /> Add Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {images.length === 0 ? (
          <div className="text-sm text-gray-500">No files yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden shadow border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-28 object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(i);
                  }}
                  className="absolute top-1 right-1 bg-red-700 text-white rounded-full p-1 hover:bg-red-800"
                  aria-label="Remove image"
                  type="button"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <img
            src={images[lightboxIndex]}
            alt={`Gallery ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white text-3xl font-bold"
            aria-label="Close lightbox"
            type="button"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
