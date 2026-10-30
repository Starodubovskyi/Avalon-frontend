"use client";

import { useState, useEffect, useRef } from "react";
import type { InputHTMLAttributes } from "react";
import {
  IconX,
  IconCheck,
  IconUser,
  IconBriefcase,
  IconPhone,
  IconMail,
  IconMapPin,
  IconLoader,
  IconCamera,
} from "@tabler/icons-react";
import type { CreateMapPointDto } from "@/lib/domain/map-point";
import { uploadFile } from "@/lib/api/files";
import { isAbortError } from "@/lib/api/map-points";

interface CreatePointFormProps {
  lat: number;
  lng: number;
  onSave: (data: Omit<CreateMapPointDto, "lat" | "lng">) => void;
  onCancel: () => void;
}

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  isLoading?: boolean;
};

function FormInput({ icon: Icon, isLoading, ...props }: FormInputProps) {
  return (
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
}

export default function CreatePointForm({
  lat,
  lng,
  onSave,
  onCancel,
}: CreatePointFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    activity: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressHint, setAddressHint] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoUploadAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const ac = new AbortController();

    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      setAddressHint(null);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const headerAttempts: HeadersInit[] = [
          {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "AvalonCRM/1.0",
          },
          { "Accept-Language": "en-US,en;q=0.9" },
        ];

        let displayName: string | null = null;
        let lastFailure = false;

        for (const headers of headerAttempts) {
          try {
            const response = await fetch(url, { headers, signal: ac.signal });
            if (!response.ok) {
              lastFailure = true;
              continue;
            }
            const data: unknown = await response.json();
            if (
              data &&
              typeof data === "object" &&
              "display_name" in data &&
              typeof data.display_name === "string"
            ) {
              displayName = data.display_name;
              lastFailure = false;
              break;
            }
          } catch (error) {
            if (isAbortError(error) || ac.signal.aborted) return;
            lastFailure = true;
          }
        }

        if (ac.signal.aborted) return;
        if (displayName) {
          setFormData((prev) => ({ ...prev, address: displayName }));
        } else if (lastFailure) {
          setAddressHint("Address lookup failed — you can enter it manually.");
        }
      } catch (error) {
        if (isAbortError(error) || ac.signal.aborted) return;
        setAddressHint("Address lookup failed — you can enter it manually.");
      } finally {
        if (!ac.signal.aborted) setIsLoadingAddress(false);
      }
    };

    void fetchAddress();
    return () => ac.abort();
  }, [lat, lng]);

  useEffect(() => {
    return () => {
      photoUploadAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowed = new Set(["image/jpeg", "image/png", "image/gif"]);
    if (!allowed.has(file.type)) {
      setPhotoError("Use a JPG, PNG or GIF photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be 5 MB or smaller.");
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError(null);
    setPhotoId(undefined);
    photoUploadAbortRef.current?.abort();
    const ac = new AbortController();
    photoUploadAbortRef.current = ac;
    setIsUploadingPhoto(true);
    try {
      const uploaded = await uploadFile(file, ac.signal);
      if (ac.signal.aborted) return;
      setPhotoId(uploaded.id);
    } catch (error) {
      if (isAbortError(error) || ac.signal.aborted) return;
      setPhotoId(undefined);
      setPhotoError(
        error instanceof Error ? error.message : "Photo upload failed",
      );
    } finally {
      if (!ac.signal.aborted) setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingPhoto) return;
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      activity: formData.activity,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      photoId,
    });
  };

  return (
    <div className="absolute bottom-6 right-6 z-[50] w-[320px] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col gap-3 relative"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10"
        >
          <IconX size={20} />
        </button>

        <div className="text-center mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            New Point
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
        </div>

        <FormInput
          icon={IconMapPin}
          isLoading={isLoadingAddress}
          placeholder={isLoadingAddress ? "Detecting address..." : "Address (optional)"}
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
        />
        {addressHint && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 -mt-1">
            {addressHint}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <FormInput
            icon={IconUser}
            placeholder="First Name"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
          <FormInput
            icon={IconUser}
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>

        <FormInput
          icon={IconBriefcase}
          placeholder="Activity"
          value={formData.activity}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, activity: e.target.value }))
          }
        />

        <FormInput
          icon={IconPhone}
          placeholder="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
        />

        <FormInput
          icon={IconMail}
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
        />

        <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-white/15 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="sr-only"
            onChange={handlePhotoChange}
            disabled={isUploadingPhoto}
          />
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Contact preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <IconCamera size={16} className="text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {isUploadingPhoto
                ? "Uploading photo..."
                : photoId
                  ? "Photo attached"
                  : "Add photo (optional)"}
            </div>
            <div className="text-[11px] text-gray-500">JPG, PNG or GIF · 5 MB</div>
          </div>
        </label>
        {photoError && (
          <p className="text-[11px] text-red-600 dark:text-red-400 -mt-1">
            {photoError}
          </p>
        )}

        <button
          type="submit"
          disabled={isUploadingPhoto}
          className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
        >
          <IconCheck size={18} />
          Create Point
        </button>
      </form>
    </div>
  );
}
