import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PostsTable from "@/components/posts/PostsTable";
import HowItWorks from "@/components/ui/information";
import ForShipOwners from "@/components/ui/shipOwners";
import { User, Newspaper, Folder, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <DashboardCard title="Posts" count={58} icon={Newspaper} />
        <DashboardCard title="Categories" count={12} icon={Folder} />
        <DashboardCard title="Users" count={750} icon={User} />
        <DashboardCard title="Comments" count={750} icon={MessageCircle} />
      </div>

      <AnalyticsCharts />

      <section id="home"></section>

      <section id="how-it-works" className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-6">How It Works</h2>
      </section>

      <section id="for-ship-owners" className="py-20">
        <h2 className="text-3xl font-bold">For Ship Owners</h2>
      </section>

      <section id="for-inspectors" className="py-20">
        <h2 className="text-3xl font-bold">For Inspectors</h2>
      </section>

      <HowItWorks />
      <ForShipOwners />

      <PostsTable title="Latest Posts" limit={5} />
    </>
  );
}
