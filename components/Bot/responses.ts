export type BotResponse = {
  keywords: string[];
  reply: string;
  buttons?: string[];
};

export const responses: BotResponse[] = [
  {
    keywords: [
      "what do you do",
      "what is your system",
      "about you",
      "your project",
      "who are you",
      "about us"
    ],
    reply:
      "🚢 You can track ships on the map, see which ports they are visiting, what cargo they carry, and browse photos and detailed descriptions of each ship.",
  },
  {
    keywords: [
      "features",
      "what can i do",
      "what does it offer",
      "possibilities",
      "system capabilities",
      "what does we offer",
      "crm features",
      "main functions"
    ],
    reply:
      "📌 You can plan, take notes, connect with other companies, run your business — and even build your own private social network inside the platform.",
  },
  {
    keywords: [
      "fleet",
      "fleet management",
      "my ships",
      "all ships",
      "vessels",
      "ships list",
      "manage ships"
    ],
    reply:
      "🛳️ The CRM lets you monitor your entire fleet, add new vessels, update information, and see a detailed status for each ship.",
  },
  {
    keywords: [
      "map",
      "live map",
      "real time",
      "where is my ship",
      "current position",
      "tracking",
      "location"
    ],
    reply:
      "🗺️ See all ships in real-time on an interactive world map, including their current positions, routes, and destination ports.",
  },
  {
    keywords: [
      "notifications",
      "alerts",
      "push notifications",
      "event notification",
      "alarm",
      "warning"
    ],
    reply:
      "🔔 Stay up to date with instant notifications on key events: port arrivals, departures, route deviations, and custom triggers.",
  },
  {
    keywords: [
      "reports",
      "statistics",
      "analytics",
      "fleet report",
      "export",
      "download report",
      "pdf",
      "csv"
    ],
    reply:
      "📈 Generate comprehensive reports and export fleet data in PDF or CSV format for further analysis.",
  },
  {
    keywords: [
      "search",
      "filter",
      "find ship",
      "find company",
      "search by port",
      "advanced search"
    ],
    reply:
      "🔎 Use powerful search and filtering to quickly find vessels, companies, cargo, or ports.",
  },
  {
    keywords: [
      "security",
      "privacy",
      "is it safe",
      "secure",
      "data protection"
    ],
    reply:
      "🛡️ All your data is encrypted and securely stored. Access is restricted based on roles and permissions.",
  },
  {
    keywords: [
      "users",
      "profiles",
      "team",
      "add user",
      "user management",
      "permissions",
      "roles"
    ],
    reply:
      "👥 Easily manage team members, assign roles, set permissions, and keep your data organized.",
  },
  {
    keywords: [
      "events",
      "history",
      "event log",
      "logs",
      "activity",
      "timeline"
    ],
    reply:
      "📜 View a complete history of all fleet events, ship movements, and user activities in the event log.",
  },
  {
    keywords: [
      "automation",
      "auto",
      "automated",
      "rules",
      "auto actions"
    ],
    reply:
      "🤖 Automate routine tasks with custom rules — get notified, update statuses, and trigger actions automatically.",
  },
  {
    keywords: [
      "support",
      "help",
      "contact",
      "email",
      "assist",
      "get help"
    ],
    reply:
      "🛟 I can help you with ordering, payment. What do you need help with?",
    buttons: ["Shipping", "Payment"],
  },
  {
    keywords: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon"
    ],
    reply: "👋 Hello! How can I help you today?",
    buttons: ["Pricing", "Contact", "Support"],
  },
  {
    keywords: ["price", "cost", "pricing"],
    reply:
      "💸 Our plans start from **$9.99/month**. [View pricing](https://example.com/pricing)",
  },
  {
    keywords: ["payment", "pay", "method"],
    reply:
      "💳 We accept payments via **credit card**, and **bank transfer**.",
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    reply: "👋 Goodbye! Have a great day!",
  },
  {
    keywords: [],
    reply: "🤖 Sorry, I didn't quite understand that.",
  },
];
