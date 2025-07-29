import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PostsTable from "@/components/posts/PostsTable";
import HowItWorks from "@/components/ui/information";
import ForShipOwners from "@/components/ui/shipOwners";
import { User, Newspaper, Folder, MessageCircle } from "lucide-react";
import DashboardPage from "@/components/InformationMainPage";
import InspectorFeatures from "@/components/ui/inspectorFeatures";
import InspectorBenefits from "@/components/ui/inspectorBenefits";
import BannerIntro from "@/components/ui/bannerIntro";

// import ForInspectorsButton from "@/components/nav/ForInspectorsButton";
// import HomeButton from "@/components/nav/HomeButton";

export default function Home() {
  return (
    <div className="pageBackground">
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
          </div>
        </section>
      </div>
    </div>
  );
}
