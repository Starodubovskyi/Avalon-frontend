"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    question: "Alright, but what exactly do you do?",
    answer:
      "As a creative agency we work with you to develop solutions to address your brand needs. That includes various aspects of brand planning and strategy, marketing and design.",
  },
  {
    question:
      "I don't need a brand strategist but I need help executing an upcoming campaign. Can we still work together?",
    answer:
      "Absolutely. We can support you in a number of ways from campaign execution to marketing collateral, content creation and strategy.",
  },
  {
    question: "Are your rates competitive?",
    answer:
      "Our pricing model is designed to offer exceptional value. We’ll tailor a package that meets your needs while staying within your budget.",
  },
  {
    question: "Why do you have a monthly project cap?",
    answer:
      "To ensure quality and dedicated focus, we limit the number of projects we take on per month. This allows us to consistently deliver high-impact results.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="px-4 py-4 flex justify-center">
      <div className="w-auto max-w-[70rem] rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-4xl font-extrabold text-center mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-white/70 mb-12 text-base font-medium">
            We compiled a list of answers to address your most pressing
            questions regarding our Services.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = index === openIndex;
              return (
                <div
                  key={index}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 border
                    ${
                      isOpen
                        ? "bg-teal-600/80 text-white border-teal-400/40"
                        : "bg-white/[0.05] text-white border-white/10"
                    }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between p-6 text-left group"
                  >
                    <div className="flex items-start gap-4 text-left">
                      <span
                        className={`text-2xl font-bold ${
                          isOpen ? "text-white" : "text-teal-300"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-semibold leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <X className="h-5 w-5 shrink-0 text-white" />
                    ) : (
                      <Plus className="h-5 w-5 shrink-0 text-teal-300" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-8 pt-0 text-base leading-relaxed text-white/90">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
