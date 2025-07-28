/** @format */

import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PostsTable from "@/components/posts/PostsTable";
import { User, Newspaper, Folder, MessageCircle } from "lucide-react";
import DashboardPage from "@/components/InformationMainPage";

export default function Home() {
	return (
		<>
			<div className='flex flex-col justify-between gap-5 mb-5 md:flex-row'>
			</div>
			<DashboardPage/>
      {/* <PostsTable title="Latest Posts" limit={5}/> */}
		</>
	);
}
