"use client";

import { useState, useEffect, type InputHTMLAttributes } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconUser,
  IconBriefcase,
  IconPhone,
  IconMail,
  IconCheck,
} from "@tabler/icons-react";
import type { MapPoint } from "../context/PointsContext";

interface EditPointModalProps {
  point: MapPoint | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    data: Partial<Omit<MapPoint, "id" | "userId">>,
  ) => void;
}

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
};

function FormInput({ icon: Icon, ...props }: FormInputProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400" />
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
      />
    </div>
  );
}

export default function EditPointModal({
  point,
  open,
  onClose,
  onSave,
}: EditPointModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    activity: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (point) {
      setFormData({
        firstName: point.firstName || "",
        lastName: point.lastName || "",
        activity: point.activity || "",
        phone: point.phone || "",
        email: point.email || "",
      });
    }
  }, [point]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (point) {
      onSave(point.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        activity: formData.activity,
        phone: formData.phone || null,
        email: formData.email || null,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Point
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              icon={IconUser}
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <FormInput
              icon={IconUser}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          <FormInput
            icon={IconBriefcase}
            placeholder="Activity"
            value={formData.activity}
            onChange={(e) =>
              setFormData({ ...formData, activity: e.target.value })
            }
          />

          <FormInput
            icon={IconPhone}
            placeholder="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <FormInput
            icon={IconMail}
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition active:scale-[0.98]"
            >
              <IconCheck size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
