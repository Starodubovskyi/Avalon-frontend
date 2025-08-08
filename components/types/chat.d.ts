export type Reaction = {
  emoji: string;
  count: number;
  userIds: string[];
};

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
  attachments?: Attachment[];
  location?: string;
  date?: string;
  reactions?: Reaction[];
};

// export type User = {
//   id: string;
//   name: string;
//   avatar: string;
//   isOnline: boolean; // Зроблено обов’язковим!
//   isTyping: boolean;
//   unreadCount: number;
// };
export type User = {
  id: string;
  name: string;
  avatar: string; // Обязательное поле — всегда строка
  isOnline?: boolean;
  unreadCount?: number;
  isTyping?: boolean;
  isGroup?: boolean; // Для групповых чатов
  memberIds?: string[]; // Участники группы
  lastSeen?: string;
};

const newGroup: User = {
  id: newGroupId,
  name: groupName,
  avatar: avatarUrl || "",
  isOnline: false,
  unreadCount: 0,
  isTyping: false,
  isGroup: true,
  memberIds,
};
