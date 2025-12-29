"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import clsx from "clsx";
import { X, Send } from "lucide-react";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";
const INPUT_CLASS =
  "w-full rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-400";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export default function ContactModal({ open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phoneCountry: "RO",
    phoneCode: "+40",
    phone: "",
    enquiry: "",
    accept: false,
    subscribe: false,
  });

  const set = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.company.trim()) e.company = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.enquiry.trim()) e.enquiry = "Required";
    if (!form.accept) e.accept = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Mock API call
      await new Promise((r) => setTimeout(r, 1000));
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const countryOptions = [
    { code: "RO", dial: "+40" },
    { code: "UA", dial: "+380" },
    { code: "PL", dial: "+48" },
    { code: "TR", dial: "+90" },
    { code: "US", dial: "+1" },
    { code: "GB", dial: "+44" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none bg-white dark:bg-[#0d1117] shadow-2xl">
        <div className="relative p-8 sm:p-10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
            Contact Us
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            We'll get back to you as soon as possible.
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <input
                  className={clsx(
                    INPUT_CLASS,
                    errors.firstName && "ring-2 ring-red-500/50 bg-red-50/50"
                  )}
                  placeholder="First Name *"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </div>
              <div>
                <input
                  className={clsx(
                    INPUT_CLASS,
                    errors.lastName && "ring-2 ring-red-500/50 bg-red-50/50"
                  )}
                  placeholder="Last Name *"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
            </div>

            <div>
              <input
                className={clsx(
                  INPUT_CLASS,
                  errors.email && "ring-2 ring-red-500/50 bg-red-50/50"
                )}
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            <div>
              <input
                className={clsx(
                  INPUT_CLASS,
                  errors.company && "ring-2 ring-red-500/50 bg-red-50/50"
                )}
                placeholder="Company Name *"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="relative w-32 shrink-0">
                <select
                  className={clsx(
                    INPUT_CLASS,
                    "appearance-none cursor-pointer"
                  )}
                  value={form.phoneCountry}
                  onChange={(e) => {
                    const opt = countryOptions.find(
                      (c) => c.code === e.target.value
                    )!;
                    set("phoneCountry", opt.code);
                    set("phoneCode", opt.dial);
                  }}
                >
                  {countryOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} {c.dial}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className={clsx(
                  INPUT_CLASS,
                  errors.phone && "ring-2 ring-red-500/50 bg-red-50/50"
                )}
                placeholder="Phone Number *"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>

            <div>
              <textarea
                className={clsx(
                  INPUT_CLASS,
                  "rounded-3xl min-h-[120px] resize-none",
                  errors.enquiry && "ring-2 ring-red-500/50 bg-red-50/50"
                )}
                placeholder="How can we help? *"
                value={form.enquiry}
                onChange={(e) => set("enquiry", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={form.accept}
                  onChange={(e) => set("accept", e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={clsx(
                    "w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all",
                    errors.accept && "border-red-500"
                  )}
                />
                <CheckIcon className="absolute w-3.5 h-3.5 text-white left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 pt-0.5">
                I accept the{" "}
                <a href="#" className="underline hover:text-blue-500">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-blue-500">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={form.subscribe}
                  onChange={(e) => set("subscribe", e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all" />
                <CheckIcon className="absolute w-3.5 h-3.5 text-white left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 pt-0.5">
                Subscribe to newsletter.
              </span>
            </label>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className={clsx(
                "px-8 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-blue-500/25 hover:opacity-90 active:scale-95 transition-all text-sm flex items-center gap-2",
                GRADIENT_BG,
                submitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={16} /> Send Enquiry
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
