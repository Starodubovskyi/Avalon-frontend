"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatList from "@/components/chat/ChatList";
import { users as initialUsers } from "@/components/shared/fakeData";

export default function ChatPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState(
    initialUsers.find((u) => u.id !== "u1")?.id || ""
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatList
        users={users}
        setUsers={setUsers}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />
      <ChatWindow
        otherUserId={selectedUserId}
      />
    </div>
  );
}
