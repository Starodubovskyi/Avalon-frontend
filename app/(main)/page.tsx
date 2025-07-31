"use client";

import { useState } from "react";

import HowItWorks from "@/components/ui/information";
import ForShipOwners from "@/components/ui/shipOwners";
import DashboardPage from "@/components/InformationMainPage";
import InspectorFeatures from "@/components/ui/inspectorFeatures";
import InspectorBenefits from "@/components/ui/inspectorBenefits";
import FAQ from "@/components/MostAskedQuestion";
import TrustedByBusinesses from "@/components/ui/trustedByBusinesses";
import ClientsSpeak from "@/components/ui/clientsSpeak";
import { Footer } from "@/components/ui/footer";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className={`${isAuthModalOpen ? "modal-open" : ""}`}>
      <div className="mainContent">
        <section id="home">
          <DashboardPage />
        </section>

        <section id="how-it-works" className="pt-0 pb-32 ">
          <div>
            <HowItWorks />
          </div>
        </section>

        <section id="for-ship-owners" className="-mt-2 pt-0 pb-32">
          <div>
            <ForShipOwners />
          </div>
        </section>

        <section id="for-inspectors" className="-mt-8 pt-0 pb-16">
          <div>
            <InspectorFeatures />
            <InspectorBenefits />
            <TrustedByBusinesses />
            <ClientsSpeak />
          </div>
        </section>

        <FAQ />
        <Footer />
      </div>

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
  );
}
