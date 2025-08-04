import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCompany } from "@/app/(admin)/admincompanies/page";

interface AddEditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: AdminCompany) => void;
  companyToEdit: AdminCompany | null;
}

const AddEditCompanyModal: React.FC<AddEditCompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  companyToEdit,
}) => {
  const [formData, setFormData] = useState<AdminCompany>({
    id: "",
    companyName: "",
    email: "",
    accountURL: "",
    plan: "Basic (Monthly)",
    createdDate: new Date().toISOString().split("T")[0],
    status: "Active",
    logoUrl: "",
  });

  useEffect(() => {
    if (companyToEdit) {
      setFormData({
        ...companyToEdit,
        createdDate: companyToEdit.createdDate
          ? new Date(companyToEdit.createdDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        id: "",
        companyName: "",
        email: "",
        accountURL: "",
        plan: "Basic (Monthly)",
        createdDate: new Date().toISOString().split("T")[0],
        status: "Active",
        logoUrl: "",
      });
    }
  }, [companyToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdDate: new Date(formData.createdDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {companyToEdit ? "Edit Company" : "Add New Company"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <label
              htmlFor="companyName"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Company Name
            </label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="accountURL"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Account URL
            </label>
            <Input
              id="accountURL"
              name="accountURL"
              value={formData.accountURL}
              onChange={handleChange}
              required
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="plan"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Plan
            </label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="Basic (Monthly)">Basic (Monthly)</option>
              <option value="Basic (Yearly)">Basic (Yearly)</option>
              <option value="Advanced (Monthly)">Advanced (Monthly)</option>
              <option value="Advanced (Yearly)">Advanced (Yearly)</option>
              <option value="Enterprise (Monthly)">Enterprise (Monthly)</option>
              <option value="Enterprise (Yearly)">Enterprise (Yearly)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="createdDate"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Created Date
            </label>
            <Input
              id="createdDate"
              name="createdDate"
              type="date"
              value={formData.createdDate}
              onChange={handleChange}
              required
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="logoUrl"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Logo URL (Optional)
            </label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="rounded-full bg-black text-white hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 px-6 py-2"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditCompanyModal;
