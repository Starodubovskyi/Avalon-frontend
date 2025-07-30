"use client";

import React from "react";
import { Mail, Ship } from "lucide-react";

type Props = {
  onContactClick: () => void;
  onServicesClick: () => void;
};

export default function ButonContackt({ onContactClick, onServicesClick }: Props) {
  return (
    <div className="z-10 relative flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full">
      <button
        onClick={onServicesClick}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-full font-semibold text-[15px] sm:text-[16px] text-white bg-black border-none shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#111]"
      >
        <Ship className="w-5 h-5" />
        <span>Our Services</span>
      </button>
      <button
        onClick={onContactClick}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-full font-semibold text-[15px] sm:text-[16px] text-black bg-white border-2 border-black shadow-md opacity-80 hover:opacity-100 transition-transform duration-200 hover:scale-105 hover:bg-[#f4f4f4]"
      >
        <Mail className="w-5 h-5" />
        <span>Contact Us</span>
      </button>
    </div>
  );
}
