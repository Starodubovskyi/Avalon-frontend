import React, { useRef, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-400 shadow-lg rounded-xl p-6 dark:bg-white/10 dark:border-white/30 dark:shadow-white/20">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-between">
          Gallery
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-700 dark:text-blue-400 hover:underline flex items-center"
            type="button"
          >
            <FaPlus className="mr-1" /> Add Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative rounded overflow-hidden shadow-md cursor-pointer"
              onClick={() => openLightbox(i)}
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-24 object-cover"
              />
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
      </div>

      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
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
