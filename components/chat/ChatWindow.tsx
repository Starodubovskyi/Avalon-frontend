"use client";

import { useEffect, useRef, useState } from "react";
import { users, currentUserId } from "@/components/shared/fakeData";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { Message } from "../types/chat";
import ChatInput from "./ChatInput";
import ForwardUserSelector from "./ForwardUserSelector";
import clsx from "clsx";
import { X, Search, Phone, MoreVertical, ArrowLeft } from "lucide-react";
import UserInfoModal from "./UserInfoModal";

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type Reaction = {
  emoji: string;
  count: number;
  userIds: string[];
};

type MessageWithReactions = Message & {
  reactions?: Reaction[];
  replyTo?: MessageWithReactions | null;
  changed?: boolean;
};

type MessagesByUserId = Record<string, MessageWithReactions[]>;

type Props = {
  otherUserId: string;
  users: typeof users;
};

export default function ChatWindow({ otherUserId, users }: Props) {
  const currentUser = users.find((u) => u.id === currentUserId)!;
  const otherUser = users.find((u) => u.id === otherUserId)!;

  const [messagesByUser, setMessagesByUser] = useState<MessagesByUserId>({});
  const [messages, setMessages] = useState<MessageWithReactions[]>([]);
  const [replyToMessage, setReplyToMessage] =
    useState<MessageWithReactions | null>(null);
  const [editMessage, setEditMessage] = useState<MessageWithReactions | null>(
    null
  );
  const [editInputText, setEditInputText] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [hiddenMessageIdsForCurrentUser, setHiddenMessageIdsForCurrentUser] =
    useState<Set<string>>(new Set());
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [selectionMode, setSelectionMode] = useState(false);

  const [forwardMessage, setForwardMessage] =
    useState<MessageWithReactions | null>(null);
  const [showForwardPanel, setShowForwardPanel] = useState(false);
  const [forwardInputText, setForwardInputText] = useState("");
  const [forwardMessagesForMultiple, setForwardMessagesForMultiple] = useState<
    MessageWithReactions[] | null
  >(null);

  const [pinnedMessagesByUser, setPinnedMessagesByUser] = useState<
    Record<string, MessageWithReactions[]>
  >({});
  const [activePinnedIndexByUser, setActivePinnedIndexByUser] = useState<
    Record<string, number>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showUserInfo, setShowUserInfo] = useState(false);

  const pinnedMessages = pinnedMessagesByUser[otherUserId] ?? [];
  const activePinnedIndex = activePinnedIndexByUser[otherUserId] ?? 0;

  const setActivePinnedIndexForCurrentUser = (index: number) => {
    setActivePinnedIndexByUser((prev) => ({
      ...prev,
      [otherUserId]: index,
    }));
  };

  useEffect(() => {
    setHiddenMessageIdsForCurrentUser(new Set());
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
    setReplyToMessage(null);
    setEditMessage(null);
    setEditInputText("");

    setMessages(messagesByUser[otherUserId] ?? []);

    setForwardMessage(null);
    setShowForwardPanel(false);
    setForwardInputText("");
    setForwardMessagesForMultiple(null);

    const pinnedForUser = pinnedMessagesByUser[otherUserId];
    if (pinnedForUser && pinnedForUser.length > 0) {
      setActivePinnedIndexByUser((prev) => ({
        ...prev,
        [otherUserId]: pinnedForUser.length - 1,
      }));
    } else {
      setActivePinnedIndexByUser((prev) => ({
        ...prev,
        [otherUserId]: 0,
      }));
    }
  }, [messagesByUser, otherUserId, pinnedMessagesByUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateMessagesForUser = (newMessages: MessageWithReactions[]) => {
    setMessages(newMessages);
    setMessagesByUser((prev) => ({
      ...prev,
      [otherUserId]: newMessages,
    }));
  };

  const handleSendMessage = (
    text: string,
    attachments?: File[],
    location?: string
  ) => {
    if (!text.trim() && (!attachments || attachments.length === 0) && !location)
      return;

    if (editMessage) {
      const updatedMessages = messages.map((m) =>
        m.id === editMessage.id
          ? {
              ...m,
              text,
              attachments: attachments
                ? attachments.map((file) => ({
                    name: file.name,
                    type: file.type,
                    url: URL.createObjectURL(file),
                  }))
                : m.attachments,
              location: location || m.location,
              changed: true,
            }
          : m
      );

      updateMessagesForUser(updatedMessages);
      setEditMessage(null);
      setEditInputText("");
      return;
    }

    const filesToUrls =
      attachments?.map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })) || [];

    const newMessage: MessageWithReactions = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      attachments: filesToUrls,
      location: location || undefined,
      reactions: [],
      replyTo: replyToMessage,
    };

    updateMessagesForUser([...messages, newMessage]);
    setReplyToMessage(null);
  };

  const startForwarding = (msg: MessageWithReactions) => {
    setForwardMessage(msg);
    setShowForwardPanel(true);
    setForwardMessagesForMultiple(null);
    setEditMessage(null);
    setEditInputText("");
    setReplyToMessage(null);
  };

  const cancelForwarding = () => {
    setForwardMessage(null);
    setShowForwardPanel(false);
    setForwardInputText("");
    setForwardMessagesForMultiple(null);
  };

  const handleForwardToUser = (forwardToUserId: string) => {
    if (!forwardMessage) return;
    const originalSender =
      users.find((u) => u.id === forwardMessage.senderId)?.name || "Unknown";
    const forwardedText = `Forwarded from ${originalSender}:\n${
      forwardMessage.text || ""
    }`;
    const newMessage: MessageWithReactions = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: forwardToUserId,
      text: forwardedText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      attachments: forwardMessage.attachments
        ? [...forwardMessage.attachments]
        : [],
      location: forwardMessage.location,
      reactions: [],
      replyTo: null,
    };
    setMessagesByUser((prev) => {
      const prevMessages = prev[forwardToUserId] ?? [];
      return { ...prev, [forwardToUserId]: [...prevMessages, newMessage] };
    });
    if (forwardToUserId === otherUserId)
      setMessages((prev) => [...prev, newMessage]);
    cancelForwarding();
  };

  const handleForwardToMultipleUsers = (
    userIds: string[],
    messagesToForward: MessageWithReactions[]
  ) => {
    if (!messagesToForward || messagesToForward.length === 0) return;
    setEditMessage(null);
    setEditInputText("");
    setReplyToMessage(null);
    setMessagesByUser((prev) => {
      const newState = { ...prev };
      userIds.forEach((userId) => {
        messagesToForward.forEach((msg) => {
          const originalSender =
            users.find((u) => u.id === msg.senderId)?.name || "Unknown";
          const forwardedText = `Forwarded from ${originalSender}:\n${
            msg.text || ""
          }`;
          const newMsg: MessageWithReactions = {
            id:
              Date.now().toString() +
              userId +
              Math.random().toString(36).slice(2),
            senderId: currentUserId,
            receiverId: userId,
            text: forwardedText,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "sent",
            attachments: msg.attachments ? [...msg.attachments] : [],
            location: msg.location,
            reactions: [],
            replyTo: null,
          };
          newState[userId] = [...(newState[userId] ?? []), newMsg];
          if (userId === otherUserId) setMessages((prev) => [...prev, newMsg]);
        });
      });
      return newState;
    });
    cancelForwarding();
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
    setForwardMessagesForMultiple(null);
  };

  const handleReact = (msg: MessageWithReactions, emoji: string) => {
    const newMessages = messages.map((m) => {
      if (m.id !== msg.id) return m;
      let reactions = m.reactions ?? [];
      const reactionIndex = reactions.findIndex((r) => r.emoji === emoji);
      if (reactionIndex === -1) {
        reactions = [
          ...reactions,
          { emoji, count: 1, userIds: [currentUserId] },
        ];
      } else {
        const reaction = reactions[reactionIndex];
        const userIndex = reaction.userIds.indexOf(currentUserId);
        if (userIndex === -1) {
          reaction.userIds.push(currentUserId);
          reaction.count = reaction.userIds.length;
        } else {
          reaction.userIds.splice(userIndex, 1);
          reaction.count = reaction.userIds.length;
          if (reaction.count === 0) reactions.splice(reactionIndex, 1);
        }
      }
      return { ...m, reactions };
    });
    updateMessagesForUser(newMessages);
  };

  const handleReply = (msg: MessageWithReactions) => {
    setReplyToMessage(msg);
    setEditMessage(null);
    setEditInputText("");
    setForwardMessage(null);
    setShowForwardPanel(false);
    setForwardInputText("");
    setForwardMessagesForMultiple(null);
  };

  const handleEditMessage = (msg: MessageWithReactions) => {
    setEditMessage(msg);
    setEditInputText(msg.text || "");
    setReplyToMessage(null);
    setForwardMessage(null);
    setShowForwardPanel(false);
    setForwardInputText("");
    setForwardMessagesForMultiple(null);
  };

  const togglePinMessage = (msg: MessageWithReactions) => {
    setPinnedMessagesByUser((prev) => {
      const currentPinned = prev[otherUserId] ?? [];
      const exists = currentPinned.find((m) => m.id === msg.id);
      let newPinned: MessageWithReactions[];
      if (exists) {
        newPinned = currentPinned.filter((m) => m.id !== msg.id);
        setActivePinnedIndexByUser((prevIdx) => {
          const currentIndex = prevIdx[otherUserId] ?? 0;
          let newIndex = currentIndex;
          if (currentIndex >= newPinned.length)
            newIndex = Math.max(0, newPinned.length - 1);
          return { ...prevIdx, [otherUserId]: newIndex };
        });
      } else {
        newPinned = [...currentPinned, msg];
      }
      return { ...prev, [otherUserId]: newPinned };
    });
  };

  const handleCopy = (msg: MessageWithReactions) => {
    if (msg.text) navigator.clipboard.writeText(msg.text);
  };

  const handleForward = (msg: MessageWithReactions) => {
    startForwarding(msg);
  };

  const handleDeleteForAll = (msg: MessageWithReactions) => {
    const newMessages = messages.filter((m) => m.id !== msg.id);
    updateMessagesForUser(newMessages);
    if (replyToMessage?.id === msg.id) setReplyToMessage(null);
    setSelectedMessageIds((prev) => {
      if (prev.has(msg.id)) {
        const copy = new Set(prev);
        copy.delete(msg.id);
        return copy;
      }
      return prev;
    });
    setPinnedMessagesByUser((prev) => {
      const currentPinned = prev[otherUserId] ?? [];
      return {
        ...prev,
        [otherUserId]: currentPinned.filter((m) => m.id !== msg.id),
      };
    });
  };

  const handleDeleteForMe = (msg: MessageWithReactions) => {
    setHiddenMessageIdsForCurrentUser((prev) => new Set(prev).add(msg.id));
    if (replyToMessage?.id === msg.id) setReplyToMessage(null);
  };

  const toggleSelectMessage = (msg: MessageWithReactions) => {
    setSelectedMessageIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(msg.id)) {
        copy.delete(msg.id);
        if (copy.size === 0) setSelectionMode(false);
      } else {
        copy.add(msg.id);
        if (!selectionMode) setSelectionMode(true);
      }
      return copy;
    });
  };

  const handleSelectAll = () => {
    const allIds = messages
      .filter((msg) => !hiddenMessageIdsForCurrentUser.has(msg.id))
      .map((m) => m.id);
    setSelectedMessageIds(new Set(allIds));
    setSelectionMode(true);
  };

  function smoothScrollToContainer(
    container: HTMLElement,
    target: HTMLElement,
    duration = 300
  ) {
    const start = container.scrollTop;
    const containerHeight = container.clientHeight;
    const targetOffset = target.offsetTop;
    const targetHeight = target.offsetHeight;
    const targetScrollTop =
      targetOffset - containerHeight / 2 + targetHeight / 2;
    const distance = targetScrollTop - start;
    let startTime: number | null = null;
    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      container.scrollTop = start + distance * easeInOut;
      if (elapsed < duration) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  const handleJumpToMessage = (id: string) => {
    const container = scrollContainerRef.current;
    const el = messageRefs.current[id];
    if (container && el) {
      smoothScrollToContainer(container, el, 300);
      setHighlightedMessageId(id);
      setTimeout(() => setHighlightedMessageId(null), 2500);
    }
  };

  const onPinnedTextClick = () => {
    if (pinnedMessages.length === 0) return;
    const newIndex =
      activePinnedIndex === 0
        ? pinnedMessages.length - 1
        : activePinnedIndex - 1;
    handleJumpToMessage(pinnedMessages[activePinnedIndex].id);
    setActivePinnedIndexForCurrentUser(newIndex);
  };

  const handleUserInfoToggle = () => setShowUserInfo(true);

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#050505] relative">
      {/* HEADER */}
      <div className="relative flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-md z-10 shadow-sm h-16">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("app:chat-back"))
            }
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={handleUserInfoToggle}
          >
            <div className="relative">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${GRADIENT_BG}`}
                >
                  {otherUser.name ? otherUser.name[0] : "?"}
                </div>
              )}
              {otherUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0d1117] rounded-full" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">
                {otherUser.name}
              </h2>
              <span className="text-xs text-blue-500 font-medium">
                {otherUser.isOnline ? "Online" : "Last seen recently"}
              </span>
            </div>
          </div>
        </div>

        {selectionMode ? (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-3 bg-white dark:bg-[#0d1117] h-full px-4">
            <span className="text-sm font-semibold mr-2">
              {selectedMessageIds.size} selected
            </span>
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedMessageIds(new Set());
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-sm font-medium hover:opacity-80"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectAll}
              className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90 ${GRADIENT_BG}`}
            >
              Select All
            </button>
            <button
              onClick={() => {
                const newMessages = messages.filter(
                  (msg) => !selectedMessageIds.has(msg.id)
                );
                updateMessagesForUser(newMessages);
                setSelectedMessageIds(new Set());
                setSelectionMode(false);
                if (replyToMessage && selectedMessageIds.has(replyToMessage.id))
                  setReplyToMessage(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => {
                const msgsToForward = messages.filter((msg) =>
                  selectedMessageIds.has(msg.id)
                );
                setForwardMessagesForMultiple(msgsToForward);
                setShowForwardPanel(true);
                setEditMessage(null);
                setEditInputText("");
                setReplyToMessage(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
            >
              Forward
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        )}
      </div>

      {/* PINNED MESSAGES */}
      {pinnedMessages.length > 0 && (
        <div
          className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-sm z-10 cursor-pointer"
          onClick={onPinnedTextClick}
        >
          <div className="flex flex-col gap-0.5 mr-3">
            {pinnedMessages.map((m, idx) => (
              <div
                key={m.id}
                className={clsx(
                  "w-1 rounded-full transition-all",
                  idx === activePinnedIndex
                    ? "h-4 bg-blue-500"
                    : "h-1.5 bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500 mb-0.5">
              Pinned Message
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {pinnedMessages[activePinnedIndex]?.text || "Attachment"}
            </p>
          </div>
        </div>
      )}

      {/* MESSAGES LIST */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent bg-[#f8f9fa] dark:bg-[#050505]"
      >
        {messages
          .filter((msg) => !hiddenMessageIdsForCurrentUser.has(msg.id))
          .map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUserId}
              sender={msg.senderId === currentUserId ? currentUser : otherUser}
              onReply={handleReply}
              onPin={togglePinMessage}
              onCopy={handleCopy}
              onForward={handleForward}
              onDelete={handleDeleteForAll}
              onDeleteForMe={handleDeleteForMe}
              onSelect={toggleSelectMessage}
              onReact={handleReact}
              userReactions={
                msg.reactions?.some((r) => r.userIds.includes(currentUserId))
                  ? new Set(
                      msg.reactions
                        .filter((r) => r.userIds.includes(currentUserId))
                        .map((r) => `${msg.id}_${r.emoji}`)
                    )
                  : new Set()
              }
              onJumpToMessage={handleJumpToMessage}
              containerRef={(el) => {
                messageRefs.current[msg.id] = el;
              }}
              highlighted={highlightedMessageId === msg.id}
              isSelected={selectionMode && selectedMessageIds.has(msg.id)}
              showSelectCircle={selectionMode}
              isPinned={pinnedMessages.some((m) => m.id === msg.id)}
              onEdit={handleEditMessage}
            />
          ))}
        {otherUser.isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* FORWARD PANEL */}
      {showForwardPanel && (
        <div className="absolute inset-x-0 bottom-0 z-50">
          <ForwardUserSelector
            users={users}
            currentUserId={currentUserId}
            forwardMessages={
              forwardMessagesForMultiple
                ? forwardMessagesForMultiple
                : forwardMessage
                ? [forwardMessage]
                : []
            }
            onCancel={cancelForwarding}
            onForward={(userIds) => {
              if (forwardMessagesForMultiple)
                handleForwardToMultipleUsers(
                  userIds,
                  forwardMessagesForMultiple
                );
              else userIds.forEach((userId) => handleForwardToUser(userId));
            }}
          />
        </div>
      )}

      {/* INPUT */}
      <ChatInput
        onSend={handleSendMessage}
        replyTo={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        editingMessage={editMessage}
        onCancelEdit={() => {
          setEditMessage(null);
          setEditInputText("");
        }}
        inputText={editMessage ? editInputText : undefined}
        setInputText={editMessage ? setEditInputText : undefined}
      />

      {/* USER INFO MODAL */}
      {showUserInfo && (
        <UserInfoModal
          user={otherUser}
          messages={messages}
          notificationsEnabled={true}
          setNotificationsEnabled={() => {}}
          onClose={() => setShowUserInfo(false)}
          onSendMessageClick={() => {
            setShowUserInfo(false);
            setTimeout(
              () =>
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
              100
            );
          }}
          pinnedMessages={pinnedMessages}
        />
      )}
    </div>
  );
}
