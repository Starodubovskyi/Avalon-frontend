"use client";

import { useEffect, useRef, useState } from "react";
import { users, currentUserId } from "@/components/shared/fakeData";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { Message } from "../types/chat";
import ChatInput from "./ChatInput";
import ForwardUserSelector from "./ForwardUserSelector";
import clsx from "clsx";
import { X } from "lucide-react";
import UserInfoModal from "./UserInfoModal";

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const handleSendForwardMessage = (text: string) => {
    if (!forwardMessage) return;

    const originalSender =
      users.find((u) => u.id === forwardMessage.senderId)?.name || "Unknown";

    const forwardedText = `Forwarded from ${originalSender}:\n${
      forwardMessage.text || ""
    }`;

    const combinedText = text.trim()
      ? text.trim() + "\n\n" + forwardedText
      : forwardedText;

    const newMessage: MessageWithReactions = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      text: combinedText,
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

    updateMessagesForUser([...messages, newMessage]);
    setReplyToMessage(null);
    cancelForwarding();
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
      return {
        ...prev,
        [forwardToUserId]: [...prevMessages, newMessage],
      };
    });

    if (forwardToUserId === otherUserId) {
      setMessages((prev) => [...prev, newMessage]);
    }

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
        const prevMessages = newState[userId] ?? [];

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

          if (userId === otherUserId) {
            setMessages((prev) => [...prev, newMsg]);
          }
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
          if (reaction.count === 0) {
            reactions.splice(reactionIndex, 1);
          }
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
          if (currentIndex >= newPinned.length) {
            newIndex = Math.max(0, newPinned.length - 1);
          }
          return { ...prevIdx, [otherUserId]: newIndex };
        });
      } else {
        newPinned = [...currentPinned, msg];
      }

      return {
        ...prev,
        [otherUserId]: newPinned,
      };
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

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      }
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

  const onPinnedClick = (clickedIndex: number) => {
    handleJumpToMessage(pinnedMessages[clickedIndex].id);
    setTimeout(() => {
      setActivePinnedIndexForCurrentUser(
        clickedIndex === 0 ? pinnedMessages.length - 1 : clickedIndex - 1
      );
    }, 100);
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

  const handleUserInfoToggle = () => {
    setShowUserInfo(true);
  };

  const handleUserInfoClose = () => {
    setShowUserInfo(false);
  };

  return (
    <>
      {/* Основной контейнер — фон, как у карточки */}
      <div className="flex flex-col flex-1 h-full bg-white dark:bg-white/5 text-gray-900 dark:text-white">
        {/* Хедер — тот же фон и ослабленный бордер в тёмной теме */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("app:chat-back"))
            }
            aria-label="Back"
            className="md:hidden absolute left-3 top-3 p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur border border-gray-200 dark:border-gray-700 shadow"
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

          <div
            className="ml-auto flex items-center gap-3 cursor-pointer select-none"
            onClick={handleUserInfoToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleUserInfoToggle();
            }}
            title={`View ${otherUser.name} info`}
          >
            <div className="text-right">
              <h2 className="font-semibold text-lg leading-5">{otherUser.name}</h2>
              <span className="text-xs text-green-500">
                {otherUser.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {otherUser.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                  />
                </svg>
              </div>
            )}
          </div>

          {selectionMode && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedMessageIds(new Set());
                }}
                className="px-3 py-1 rounded text-sm font-medium bg-blue-700 text-white hover:bg-blue-800"
              >
                Cancel Select
              </button>

              <button
                onClick={handleSelectAll}
                className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
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
                  if (
                    replyToMessage &&
                    selectedMessageIds.has(replyToMessage.id)
                  ) {
                    setReplyToMessage(null);
                  }
                }}
                className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Delete Selected
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
                className="px-3 py-1 rounded text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
              >
                Forward Selected
              </button>
            </div>
          )}
        </div>

        {pinnedMessages.length > 0 && (
          <div className="flex items-center px-4 py-2 border-b border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 h-14 select-none">
            <div
              className="flex flex-col items-center justify-center gap-1"
              style={{ height: 24, width: 8 }}
            >
              {pinnedMessages.map((msg, idx) => {
                const isActive = idx === activePinnedIndex;

                const totalHeight = 24;
                const barHeight = totalHeight / pinnedMessages.length;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setActivePinnedIndexForCurrentUser(idx);
                      handleJumpToMessage(pinnedMessages[idx].id);
                    }}
                    title={msg.text || "Pinned message"}
                    className={clsx(
                      "w-1.5 rounded cursor-pointer transition-colors duration-200",
                      isActive
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-gray-400 dark:bg-gray-600 border-gray-400 dark:border-gray-600",
                      "border"
                    )}
                    style={{
                      height: barHeight,
                      borderStyle: "solid",
                    }}
                  />
                );
              })}
            </div>

            <div
              className="ml-4 flex-1 text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer select-text"
              onClick={onPinnedTextClick}
              title={pinnedMessages[activePinnedIndex]?.text}
            >
              {pinnedMessages.length > 0
                ? pinnedMessages[activePinnedIndex]?.text.length > 60
                  ? pinnedMessages[activePinnedIndex]?.text.slice(0, 60) + "..."
                  : pinnedMessages[activePinnedIndex]?.text
                : ""}
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent"
        >
          {messages
            .filter((msg) => !hiddenMessageIdsForCurrentUser.has(msg.id))
            .map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isCurrentUser={msg.senderId === currentUserId}
                sender={
                  msg.senderId === currentUserId ? currentUser : otherUser
                }
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

        {showForwardPanel && (
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
              if (forwardMessagesForMultiple) {
                handleForwardToMultipleUsers(
                  userIds,
                  forwardMessagesForMultiple
                );
              } else {
                userIds.forEach((userId) => handleForwardToUser(userId));
              }
            }}
          />
        )}

        <ChatInput
          onSend={handleSendMessage}
          replyTo={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />

        {showUserInfo && (
          <UserInfoModal
            user={otherUser}
            messages={messages}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            onClose={() => setShowUserInfo(false)}
            onSendMessageClick={() => {
              setShowUserInfo(false);
              scrollContainerRef.current!.scrollTop =
                scrollContainerRef.current!.scrollHeight;
            }}
            pinnedMessages={pinnedMessages}
          />
        )}
      </div>
    </>
  );
}
