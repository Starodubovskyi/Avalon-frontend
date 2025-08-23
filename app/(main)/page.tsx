"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

import LoaderRadar from "@/components/Loader/LoaderRadar";

import HowItWorks from "@/components/main/information";
import ForShipOwners from "@/components/main/shipOwners";
const DashboardPage = dynamic(() => import("@/components/main/InformationMainPage"), {
  ssr: false,
});
import InspectorFeatures from "@/components/main/inspectorBenefits";

import FAQ from "@/components/main/MostAskedQuestion";
import TrustedByBusinesses from "@/components/main/trustedByBusinesses";
import ClientsSpeak from "@/components/main/clientsSpeak";
import { Footer } from "@/components/main/footer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";

function SectionFade({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.section
      id={id}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className={`w-full px-4 sm:px-6 lg:px-10 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.body.classList.add("text-white", "antialiased", "bg-transparent", "overflow-x-clip");
    return () => {
      document.body.classList.remove("text-white", "antialiased", "bg-transparent", "overflow-x-clip");
    };
  }, []);

  useEffect(() => {
    const mm = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mm.matches);
    update();
    mm.addEventListener?.("change", update);
    return () => mm.removeEventListener?.("change", update);
  }, []);

  
 function AnimatedBackground() {
       return ( 
       <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gray-950"> 
       <motion.div aria-hidden className="absolute -top-40 -left-40 h-[60vw] w-[60vw] rounded-full blur-3xl" 
       style={{ background: "radial-gradient(closest-side, rgba(45,212,191,0.35), transparent 70%)", }} 
       animate={{ x: [0, 60, -40, 0], y: [0, -20, 36, 0], scale: [1, 1.05, 0.98, 1], }} 
       transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} /> 
       <motion.div aria-hidden className="absolute -bottom-52 -right-40 h-[55vw] w-[55vw] rounded-full blur-3xl" 
       style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.35), transparent 70%)", }} 
       animate={{ x: [0, -50, 30, 0], y: [0, 30, -24, 0], scale: [1, 1.03, 0.97, 1], }} 
       transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 0.2, }} /> 
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_60%)]" /> 
       <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,14,0.35),transparent_35%,rgba(10,10,14,0.6))]" /> 
       </div> 
       ); 
      }
   
  return (
    <>
      <LoaderRadar />
<AnimatedBackground/>

      <div className={`${isAuthModalOpen ? "modal-open" : ""}`}>
        <main className="relative">
          <SectionFade id="home" className="pt-0">
            <DashboardPage />
          </SectionFade>

          <SectionFade id="how-it-works" className="pt-6 md:pt-10 pb-16 md:pb-28">
            <HowItWorks />
          </SectionFade>

          <SectionFade id="for-ship-owners" className="-mt-1 md:-mt-2 pb-16 md:pb-28">
            <ForShipOwners />
          </SectionFade>

          <SectionFade id="for-inspectors" className="-mt-4 md:-mt-8 pb-12 md:pb-16">
            <div className="space-y-8 ">
              <SectionFade className="-mt-4 md:-mt-8 pb-12 md:pb-20">
              <InspectorFeatures />
              </SectionFade>
              <SectionFade className="-mt-4 md:-mt-8 pb-12 md:pb-20">
              <TrustedByBusinesses />
              </SectionFade>
              <SectionFade className="-mt-4 md:-mt-8 pb-12 md:pb-20">
              <ClientsSpeak />
              </SectionFade>
            </div>
          </SectionFade>

          <SectionFade className="pb-6 md:pb-10">
            <FAQ />
          </SectionFade>

          <Footer />
        </main>

        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <DialogContent
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 rounded-lg shadow-lg bg-white dark:bg-gray-800 z-50 overflow-hidden
                       w-[95vw] h-[95vh] max-w-5xl max-h-[90vh] flex"
          >
            <DialogHeader className="hidden">
              <DialogTitle className="sr-only">Authentication</DialogTitle>
              <DialogDescription className="sr-only">
                Login or Register to access your account.
              </DialogDescription>
            </DialogHeader>
            <AuthModalContent onCloseModal={() => setIsAuthModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
