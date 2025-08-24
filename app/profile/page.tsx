"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { users as fakeUsers } from "@/components/shared/fakeData";

export default function Page() {
  const [users, setUsers] = useState(fakeUsers);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div
            className="
              w-full
              rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
              dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            "
          >
            <div className="relative flex h-full">
              <div
                className={`h-full ${selectedUserId ? "hidden md:block" : "block"} w-full md:w-80`}
              >
                <ChatList
                  users={users as any}
                  setUsers={setUsers as any}
                  selectedUserId={selectedUserId}
                  onSelectUser={setSelectedUserId}
                />
              </div>

              <div
                className={`relative h-full flex-1 ${selectedUserId ? "block" : "hidden"} md:block`}
              >
                {selectedUserId && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserId("")}
                    aria-label="Back"
                    className="md:hidden absolute top-3 left-3 z-50 p-2 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {selectedUserId ? (
                  <ChatWindow otherUserId={selectedUserId} users={users as any} />
                ) : (
                  <div className="hidden md:flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
