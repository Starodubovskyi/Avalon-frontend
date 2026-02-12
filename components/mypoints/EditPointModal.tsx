"use client";

import { useState, useEffect } from "react";
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
import type { CustomPoint } from "../context/PointsContext";

interface EditPointModalProps {
  point: CustomPoint | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
}

const Input = ({ icon: Icon, ...props }: any) => (
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

export default function EditPointModal({
  point,
  open,
  onClose,
  onSave,
}: EditPointModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    email: "",
  });

  // Заполняем форму данными при открытии
  useEffect(() => {
    if (point) {
      setFormData({
        firstName: point.firstName || "",
        lastName: point.lastName || "",
        role: point.role || "",
        phone: point.phone || "",
        email: point.email || "",
      });
    }
  }, [point]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (point) {
      onSave(point.id, formData);
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
            <Input
              icon={IconUser}
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={(e: any) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <Input
              icon={IconUser}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e: any) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          <Input
            icon={IconBriefcase}
            placeholder="Role (e.g. Agent)"
            value={formData.role}
            onChange={(e: any) =>
              setFormData({ ...formData, role: e.target.value })
            }
          />

          <Input
            icon={IconPhone}
            placeholder="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e: any) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <Input
            icon={IconMail}
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e: any) =>
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
