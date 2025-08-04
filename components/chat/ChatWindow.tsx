"use client";

import { useEffect, useRef, useState } from "react";
import { users, currentUserId } from "@/components/shared/fakeData";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { Message } from "../types/chat";
import ChatInput from "./ChatInput";

type Props = {
  otherUserId: string;
};

export default function ChatWindow({ otherUserId }: Props) {
  const currentUser = users.find((u) => u.id === currentUserId)!;
  const otherUser = users.find((u) => u.id === otherUserId)!;

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (
    text: string,
    attachments?: File[],
    location?: string
  ) => {
    const filesToUrls =
      attachments?.map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })) || [];

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      attachments: filesToUrls,
      location: location || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {otherUser.avatar ? (
            <img src={otherUser.avatar} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-lg">{otherUser.name}</h2>
            <span className="text-xs text-green-500">{otherUser.isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === currentUserId}
            sender={msg.senderId === currentUserId ? currentUser : otherUser}
          />
        ))}
        {otherUser.isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
