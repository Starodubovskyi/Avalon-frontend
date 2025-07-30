import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PostsTable from "@/components/posts/PostsTable";
import HowItWorks from "@/components/ui/information";
import ForShipOwners from "@/components/ui/shipOwners";
import { User, Newspaper, Folder, MessageCircle } from "lucide-react";
import DashboardPage from "@/components/InformationMainPage";
import InspectorFeatures from "@/components/ui/inspectorFeatures";
import InspectorBenefits from "@/components/ui/inspectorBenefits";
import FAQ from "@/components/MostAskedQuestion";
// import ForInspectorsButton from "@/components/nav/ForInspectorsButton";
// import HomeButton from "@/components/nav/HomeButton";

export default function Home() {
  return (
    <div className="pageBackground">
      <div className="mainContent">
        <DashboardPage />

        {/* Optional cards or analytics if needed later */}

        <section id="home" className="py-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-6"></h2>
          {/* <HomeButton /> */}
        </section>

        <section id="how-it-works" className="py-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-6"></h2>
          <HowItWorks />
        </section>

        <section id="for-ship-owners" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-6"></h2>
          <ForShipOwners />
        </section>

        <section id="for-inspectors" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-6"></h2>
          <InspectorFeatures />
          <InspectorBenefits />
        </section>
        <FAQ/>
      </div>
    </div>
  );
}
