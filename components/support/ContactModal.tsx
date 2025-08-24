// components/support/ContactModal.tsx
"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
    if (!form.firstName.trim()) e.firstName = "Please complete this required field.";
    if (!form.lastName.trim()) e.lastName = "Please complete this required field.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please complete this required field.";
    if (!form.company.trim()) e.company = "Please complete this required field.";
    if (!form.phone.trim()) e.phone = "Please complete this required field.";
    if (!form.enquiry.trim()) e.enquiry = "Please complete this required field.";
    if (!form.accept) e.accept = "Please complete this required field.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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
      <DialogContent className="w-full max-w-[720px] rounded-2xl p-0 overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Contact Avalon Ship</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name<span className="text-red-500">*</span></label>
              <input
                className="mt-1 w-full rounded-full border bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Last Name<span className="text-red-500">*</span></label>
              <input
                className="mt-1 w-full rounded-full border bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Email<span className="text-red-500">*</span></label>
              <input
                className="mt-1 w-full rounded-full border bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Company<span className="text-red-500">*</span></label>
              <input
                className="mt-1 w-full rounded-full border bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
              {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Phone<span className="text-red-500">*</span></label>
              <div className="mt-1 flex">
                <select
                  className="rounded-l-full border bg-gray-50 px-3 py-2.5 outline-none dark:bg-neutral-900 dark:border-white/10"
                  value={form.phoneCountry}
                  onChange={(e) => {
                    const opt = countryOptions.find((c) => c.code === e.target.value)!;
                    set("phoneCountry", opt.code);
                    set("phoneCode", opt.dial);
                  }}
                >
                  {countryOptions.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <span className="px-3 py-2.5 border-t border-b bg-gray-50 dark:bg-neutral-900 dark:border-white/10">{form.phoneCode}</span>
                <input
                  className="flex-1 rounded-r-full border bg-gray-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Enquiry<span className="text-red-500">*</span></label>
              <textarea
                className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 min-h-[110px] outline-none focus:ring-2 focus:ring-sky-400 dark:bg-neutral-900 dark:border-white/10"
                value={form.enquiry}
                onChange={(e) => set("enquiry", e.target.value)}
              />
              {errors.enquiry && <p className="mt-1 text-xs text-red-500">{errors.enquiry}</p>}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.accept}
                onChange={(e) => set("accept", e.target.checked)}
                className="mt-1"
              />
              <span>
                I accept the <a href="/terms" target="_blank" className="underline">terms of use</a> and{" "}
                <a href="/privacy" target="_blank" className="underline">privacy policy</a> of Avalon Ship.<span className="text-red-500">*</span>
              </span>
            </label>
            {errors.accept && <p className="text-xs text-red-500">{errors.accept}</p>}

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.subscribe}
                onChange={(e) => set("subscribe", e.target.checked)}
                className="mt-1"
              />
              <span>I'd like to stay up-to-date with Avalon Ship’s latest market research and upcoming events.</span>
            </label>
          </div>

          <div className="mt-4">
            <div className="rounded-md bg-gray-100 dark:bg-neutral-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 inline-block">
              protected by reCAPTCHA
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Enquiry"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
