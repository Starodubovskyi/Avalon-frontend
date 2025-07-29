"use client";

import React from "react";
import { Mail, Ship } from "lucide-react";
import style from "./Buttons.module.css";

type Props = {
  onContactClick: () => void;
  onServicesClick: () => void;
};

export default function ButonContackt({ onContactClick, onServicesClick }: Props) {
  return (
    <div className={style.buttonsContainer}>
      <button onClick={onServicesClick} className={style.serviceButton}>
        <Ship size={18} />
        <span>Our Services</span>
      </button>
      <button onClick={onContactClick} className={style.contactButton}>
        <Mail size={18} />
        <span>Contact Us</span>
      </button>
    </div>
  );
}
