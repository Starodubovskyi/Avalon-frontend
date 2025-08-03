// types/chat.d.ts
export type Attachment = {
  name: string;
  type: string;
  url: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  status: "sent" | "received" | "seen";
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
  location?: string;
  date?: string; 
};

export type User = {
  id: string;
  name: string;
  avatar: string; // обязательно
  isOnline: boolean;
  isTyping: boolean; // обязательно
  unreadCount: number; // обязательно
};


