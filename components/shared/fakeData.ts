import { Message, User } from "../types/chat";



export const currentUserId = "u1";

export const users = [
  {
    id: "u1",
    name: "You",
    avatar: "",
    isOnline: true,
    isTyping: false,
    unreadCount: 0,
  },
  {
    id: "u2",
    name: "Sarah Johnson",
    avatar: "/avatars/sarah.png",
    isOnline: true,
    isTyping: false,
    unreadCount: 3,
  },
  {
    id: "u3",
    name: "Michael Green",
    avatar: "/avatars/michael.png",
    isOnline: false,
    isTyping: false,
    unreadCount: 1,
  },
  {
    id: "u4",
    name: "Emily Clark",
    avatar: "", 
    isOnline: true,
    isTyping: true,
    unreadCount: 0,
  }
];


export const messages: Message[] = [
  {
    id: "m1",
    senderId: "u2",
    receiverId: "u1",
    text: "Hey, are you available for a quick meeting today?",
    time: "09:10 AM",
    status: "seen",
    date: "Today, August 1",
  },
  {
    id: "m2",
    senderId: "u1",
    receiverId: "u2",
    text: "Sure, I’m free after 2 PM.",
    time: "09:12 AM",
    status: "seen",
  },
  {
    id: "m3",
    senderId: "u2",
    receiverId: "u1",
    text: "Perfect, I’ll send the invite.",
    time: "09:13 AM",
    status: "seen",
  },
  {
    id: "m4",
    senderId: "u3",
    receiverId: "u1",
    text: "Can you review the latest report draft?",
    time: "08:45 AM",
    status: "sent",
    date: "Yesterday, July 31",
  },
  {
    id: "m5",
    senderId: "u1",
    receiverId: "u3",
    text: "Yes, I’ll take a look this afternoon.",
    time: "09:00 AM",
    status: "sent",
  },
  {
    id: "m6",
    senderId: "u4",
    receiverId: "u1",
    text: "The project files are now available in the shared folder.",
    time: "07:30 AM",
    status: "seen",
    date: "Monday, July 29",
  },
];
