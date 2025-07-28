"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ButonContackt from "./ui/ButonForMainPage";
import styles from "./InformationMainPage.module.css";

export default function DashboardPage() {
  const [activeBlock, setActiveBlock] = useState<"contact" | "services" | null>(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessVisible(true);

    setTimeout(() => {
      setIsSuccessVisible(false);
      setActiveBlock(null);
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveBlock(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {!activeBlock && (
          <motion.div
            key="banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.banner}
          >
            <img src="/ship-inspection.jpg" alt="Ship" className={styles.image} />
            <div className={styles.overlay}>
              <div className={styles.buttonWrap}>
                <ButonContackt
                  onContactClick={() => setActiveBlock("contact")}
                  onServicesClick={() => setActiveBlock("services")}
                />
              </div>
              <div className={styles.textContent}>
                <h2>
                  One Platform to Manage All{" "}
                  <span className={styles.highlight}>Your Ships & Cargoes</span>
                </h2>
                <p>
                  Connect ship owners with qualified inspectors to simplify
                  compliance and maintenance processes.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBlock === "contact" && (
          <motion.div
            key="contact-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.contactForm}
          >
            <button className={styles.closeButton} onClick={() => setActiveBlock(null)}>
              ✕
            </button>
            <h3 className={styles.formTitle}>Get in Touch</h3>

            <AnimatePresence>
              {isSuccessVisible && (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className={styles.successMessage}
                >
                  Message sent successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Your Name</label>
                <input type="text" className={styles.inputField} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <input type="email" className={styles.inputField} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Message</label>
                <textarea className={styles.textareaField} required />
              </div>
              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBlock === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.contactForm}
          >
            <button className={styles.closeButton} onClick={() => setActiveBlock(null)}>
              ✕
            </button>
            <h3 className={styles.formTitle}>Our Services</h3>
            <ul className={styles.serviceList}>
              <li>We track X% of ships worldwide.</li>
              <li>We provide information about what is on the ship and how much it is.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
