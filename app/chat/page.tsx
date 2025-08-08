"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import ChatWindow from "@/components/chat/ChatWindow";
import ChatList from "@/components/chat/ChatList";
import { users as initialUsers } from "@/components/shared/fakeData";

export default function ChatPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState(
    initialUsers.find((u) => u.id !== "u1")?.id || ""
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        <ChatList
          users={users}
          setUsers={setUsers}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
        <ChatWindow otherUserId={selectedUserId} users={users} />
      </div>
    </MainLayout>
  );
}
