"use client";

import React from "react";
import { Mail, Ship } from "lucide-react";

type Props = {
  onContactClick: () => void;
  onServicesClick: () => void;
};

export default function ButonContackt({ onContactClick, onServicesClick }: Props) {
  return (
    <div className="z-10 relative flex flex-wrap justify-center gap-4">
      <button
        onClick={onServicesClick}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-[16px] text-white bg-black border-none shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#111]"
      >
        <Ship className="w-5 h-5" />
        <span>Our Services</span>
      </button>
      <button
        onClick={onContactClick}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-[16px] text-black bg-white border-2 border-black shadow-md opacity-50 transition-transform duration-200 hover:scale-105 hover:bg-[#f4f4f4]"
      >
        <Mail className="w-5 h-5" />
        <span>Contact Us</span>
      </button>
    </div>
  );
}
