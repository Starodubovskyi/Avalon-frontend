"use client";

import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconHelpCircle, IconMessageCircle2, IconMail, IconBook, IconAlertCircle, IconSearch } from "@tabler/icons-react";
import ChatBot from "../../components/Bot/ChatBot";

type Topic = {
  id: string;
  title: string;
  items: { q: string; a: string }[];
};

const TOPICS: Topic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      { q: "How do I create an account?", a: "Open the profile menu and select “Sign in”. Use email or a social provider." },
      { q: "How to switch theme?", a: "Open your avatar menu and toggle the Theme switcher." },
    ],
  },
  {
    id: "maps",
    title: "Maps & vessels",
    items: [
      { q: "Why I don’t see vessels?", a: "Zoom in closer and ensure the layer is enabled in the map controls." },
      { q: "How to search a vessel?", a: "Use the search field and type a vessel name or MMSI." },
    ],
  },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const [showBot, setShowBot] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOPICS;
    return TOPICS.map((t) => ({
      ...t,
      items: t.items.filter(
        (it) =>
          it.q.toLowerCase().includes(q) ||
          it.a.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q)
      ),
    })).filter((t) => t.items.length > 0);
  }, [query]);

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-2 sm:px-4 lg:px-6 py-3">
          <div className="w-full rounded-3xl border border-gray-200 bg-white shadow-md dark:bg-white/5 dark:border-white/10">
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center">
                    <IconHelpCircle className="text-blue-600 dark:text-blue-400" size={22} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold">Help Center</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Find answers, read guides, or contact support.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search help articles…"
                    className="pl-9 h-11"
                  />
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                      <div className="flex items-start gap-3">
                        <IconAlertCircle className="text-amber-600" size={22} />
                        <div>
                          <div className="font-medium">No results for your query.</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Try another keyword or contact us below.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    filtered.map((topic) => (
                      <section key={topic.id} className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
                          <IconBook size={18} className="text-gray-500 dark:text-gray-400" />
                          <h2 className="text-base font-semibold">{topic.title}</h2>
                        </div>
                        <div className="p-3 space-y-2">
                          {topic.items.map((item, idx) => (
                            <details key={idx} className="rounded-xl border border-gray-200 dark:border-white/10 p-3">
                              <summary className="cursor-pointer font-medium">{item.q}</summary>
                              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.a}</p>
                            </details>
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <IconMessageCircle2 size={18} className="text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold">Quick help</h3>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowBot(true)}
                        className="block w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/10 transition text-left"
                      >
                        Open Support Chat
                      </button>
                      <a
                        href="/notes"
                        className="block w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      >
                        Read Notes & Guides
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <IconMail size={18} className="text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold">Contact us</h3>
                    </div>
                    <SupportForm />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBot && <ChatBot initialOpen />}
    </MainLayout>
  );
}

function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return sent ? (
    <div className="rounded-xl border border-green-200/60 dark:border-green-400/30 bg-green-50/60 dark:bg-green-900/10 p-4 text-sm">
      Your request has been saved locally. We’ll reach out via email.
    </div>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload = { name, email, topic, message, createdAt: Date.now() };
        const key = "support:tickets";
        const list = JSON.parse(localStorage.getItem(key) || "[]") as any[];
        list.push(payload);
        localStorage.setItem(key, JSON.stringify(list));
        setSent(true);
      }}
      className="space-y-3"
    >
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input type="email" placeholder="Email for reply" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Topic (e.g. Billing, Map, Chat)" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <textarea
        placeholder="Describe your issue…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
      />
      <Button type="submit" className="w-full h-11">Send request</Button>
    </form>
  );
}
