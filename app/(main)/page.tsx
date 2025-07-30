"use client";

import { useState } from "react";

import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PostsTable from "@/components/posts/PostsTable";
import HowItWorks from "@/components/ui/information";
import ForShipOwners from "@/components/ui/shipOwners";
import { User, Newspaper, Folder, MessageCircle } from "lucide-react";
import DashboardPage from "@/components/InformationMainPage";
import InspectorFeatures from "@/components/ui/inspectorFeatures";
import InspectorBenefits from "@/components/ui/inspectorBenefits";
import FAQ from "@/components/MostAskedQuestion"; // <-- твой компонент

import BannerIntro from "@/components/ui/bannerIntro";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthModalContent from "@/components/auth/AuthModalContent";
import TrustedByBusinesses from "@/components/ui/trustedByBusinesses";
import ClientsSpeak from "@/components/ui/clientsSpeak";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className={`pageBackground ${isAuthModalOpen ? "modal-open" : ""}`}>
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />

      <div className="mainContent">
        <BannerIntro />
        <DashboardPage />

        <section id="home" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6"></h2>
          </div>
        </section>

        <section id="how-it-works" className="-mt-56 pt-0 pb-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <HowItWorks />
          </div>
        </section>

        <section id="for-ship-owners" className="-mt-2 pt-0 pb-32">
          <div className="max-w-7xl mx-auto px-4">
            <ForShipOwners />
          </div>
        </section>

        <section id="for-inspectors" className="-mt-8 pt-0 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <InspectorFeatures />
            <InspectorBenefits />
            <TrustedByBusinesses />
            <ClientsSpeak />
          </div>
        </section>

        <FAQ />
      </div>

      {/* Модальное окно для входа/регистрации */}
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
