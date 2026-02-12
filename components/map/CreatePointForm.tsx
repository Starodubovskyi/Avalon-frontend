"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconCheck,
  IconUser,
  IconBriefcase,
  IconPhone,
  IconMail,
  IconMapPin,
  IconLoader,
  IconCamera, // Иконка для фото
  IconTrash, // Иконка для удаления фото
} from "@tabler/icons-react";
import clsx from "clsx";

interface CreatePointFormProps {
  lat: number;
  lng: number;
  onSave: (data: {
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
    email: string;
    address: string;
    photo?: File | null; // Добавили фото в данные сохранения
  }) => void;
  onCancel: () => void;
}

const Input = ({ icon: Icon, isLoading, ...props }: any) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {isLoading ? (
        <IconLoader size={16} className="text-blue-500 animate-spin" />
      ) : (
        <Icon size={16} className="text-gray-400" />
      )}
    </div>
    <input
      {...props}
      className="block w-full pl-10 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
    />
  </div>
);

export default function CreatePointForm({
  lat,
  lng,
  onSave,
  onCancel,
}: CreatePointFormProps) {
  // Стейт для данных формы
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    email: "",
    address: "",
  });

  // Стейт для фото
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // --- ЛОГИКА АДРЕСА ---
  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "en-US,en;q=0.9" } },
        );
        const data = await response.json();
        if (data && data.display_name) {
          setFormData((prev) => ({ ...prev, address: data.display_name }));
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };
    if (lat && lng) fetchAddress();
  }, [lat, lng]);

  // --- ЛОГИКА ФОТО ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Создаем временную ссылку для показа
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не открывалось окно выбора файла
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, photo: selectedFile });
  };

  return (
    <div className="absolute bottom-6 right-6 z-[50] w-[320px] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col gap-3 relative"
      >
        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10"
        >
          <IconX size={20} />
        </button>

        {/* --- ЗАГРУЗКА ФОТО (В САМОМ ВЕРХУ) --- */}
        <div className="flex justify-center mb-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              "relative w-24 h-24 rounded-full cursor-pointer transition-all group overflow-hidden",
              !previewUrl
                ? "bg-gray-100 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                : "border-2 border-transparent shadow-md",
            )}
          >
            {/* Скрытый инпут */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <>
                {/* Картинка */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {/* Оверлей при наведении для удаления */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleRemovePhoto}
                    type="button"
                    className="p-1.5 bg-white/20 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition"
                    title="Remove photo"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </>
            ) : (
              /* Заглушка (иконка камеры) */
              <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-blue-500 transition-colors">
                <IconCamera size={28} stroke={1.5} />
                <span className="text-[10px] font-medium mt-1">Add Photo</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            New Point
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
        </div>

        

        <Input
          icon={IconMapPin}
          isLoading={isLoadingAddress}
          placeholder={isLoadingAddress ? "Detecting address..." : "Address"}
          value={formData.address}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            icon={IconUser}
            placeholder="First Name"
            required
            value={formData.firstName}
            onChange={(e: any) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
          <Input
            icon={IconUser}
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e: any) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>

        <Input
          icon={IconBriefcase}
          placeholder="Activity"
          value={formData.role}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, role: e.target.value }))
          }
        />

        <Input
          icon={IconPhone}
          placeholder="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
        />

        <Input
          icon={IconMail}
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
        />

        <button
          type="submit"
          className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition active:scale-[0.98]"
        >
          <IconCheck size={18} />
          Create Point
        </button>
      </form>
    </div>
  );
}
