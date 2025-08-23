"use client";
import { motion } from "framer-motion";
import { Smartphone, ChartLine, CheckCircle } from "lucide-react";

const featuresLeft = [
  { title: "Smart Checklists", description: "Customizable templates for different vessel types" },
  { title: "Photo Documentation", description: "Built-in photo capture with animations" },
  { title: "Report Generation", description: "Automated professional report creation" }
];

const featuresRight = [
  { title: "Location Management", description: "Set your service areas and travel preferences" },
  { title: "Smart Scheduling", description: "Flexible calendar management system" },
  { title: "Performance Analytics", description: "Track your business growth and earnings" }
];

export default function InspectorFeatures() {
  return (
    <section
      id="for-inspectors"
      className="w-full h-full text-center flex flex-col justify-center scroll-mt-24"
    >
      <div className="w-full px-4 md:px-8 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-extrabold mb-4"
        >
          For Inspectors
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white/70 text-lg font-semibold mb-12"
        >
          Advanced tools and features designed to enhance your workflow and grow your business
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full px-4 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full rounded-3xl border border-white/10 shadow-sm p-10 text-left bg-white/[0.05] backdrop-blur-xl min-h-[28rem]"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
              <Smartphone className="text-teal-300" size={22} />
            </div>
            <h3 className="text-2xl font-bold">Digital Inspection Tools</h3>
          </div>

          <div className="space-y-4">
            {featuresLeft.map((feature, index) => (
              <div key={index} className="bg-white/5 p-5 rounded-xl flex items-start border border-white/10">
                <CheckCircle className="text-teal-300 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="text-base font-bold">{feature.title}</h4>
                  <p className="text-white/70 text-sm font-semibold">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full rounded-3xl border border-white/10 shadow-sm p-10 text-left bg-white/[0.05] backdrop-blur-xl min-h-[28rem]"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
              <ChartLine className="text-teal-300" size={22} />
            </div>
            <h3 className="text-2xl font-bold">Digital Inspection Tools</h3>
          </div>

          <div className="space-y-4">
            {featuresRight.map((feature, index) => (
              <div key={index} className="bg-white/5 p-5 rounded-xl flex items-start border border-white/10">
                <CheckCircle className="text-teal-300 mt-1 mr-3" size={20} />
                <div>
                  <h4 className="text-base font-bold">{feature.title}</h4>
                  <p className="text-white/70 text-sm font-semibold">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
