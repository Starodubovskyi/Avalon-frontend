import SupportHero from "@/components/support/SupportHero";
import CategoriesGrid from "@/components/support/CategoriesGrid";
import ChatBot from "@/components/Bot/ChatBot";

const categories = [
  {
    id: "recent-updates",
    title: "Recent Updates",
    description: "Check out the latest features of Avalon Ship.",
    authors: ["EM", "JD", "AH"],
    authorsCount: 3,
    articlesCount: 7,
  },
  {
    id: "previous-updates",
    title: "Previous Updates",
    description: "Review previous feature updates of Avalon Ship.",
    authors: ["JD", "AH"],
    authorsCount: 2,
    articlesCount: 4,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to Avalon Ship? Start here and become a pro in no time.",
    authors: ["LK"],
    authorsCount: 1,
    articlesCount: 22,
  },
  {
    id: "using-avalon",
    title: "Using Avalon Ship",
    description: "Learn the basics of using Avalon Ship day to day.",
    authors: ["RM", "LA", "DG"],
    authorsCount: 3,
    articlesCount: 62,
  },
  {
    id: "mobile-apps",
    title: "Using our Mobile Apps",
    description: "Everything you need to get started with our mobile apps.",
    authors: ["MP"],
    authorsCount: 1,
    articlesCount: 14,
  },
  {
    id: "apis",
    title: "Using APIs",
    description: "All about using and troubleshooting our APIs.",
    authors: ["LK"],
    authorsCount: 1,
    articlesCount: 8,
  },
  {
    id: "data-quality",
    title: "Data Quality & Methodology",
    description: "Understand our data sources, validation and accuracy.",
    authors: ["RM", "LA", "DG"],
    authorsCount: 3,
    articlesCount: 15,
  },
  {
    id: "ais-network",
    title: "AIS Network for Station Owners",
    description: "Complete documentation guides for AIS station owners.",
    authors: ["TZ"],
    authorsCount: 1,
    articlesCount: 9,
  },
  {
    id: "faq-troubleshooting",
    title: "FAQ and Troubleshooting",
    description: "Find answers to common questions and quick fixes.",
    authors: ["LK"],
    authorsCount: 1,
    articlesCount: 26,
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <SupportHero />
      <ChatBot/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CategoriesGrid categories={categories} />
      </div>
    </main>
  );
}
