"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Message, User } from "../types/chat";
import {
  Check,
  CheckCircle,
  MessageCircle,
  Pin,
  Copy,
  Share,
  Trash2,
  CheckSquare,
  Edit3 as EditIcon,
} from "lucide-react";

type Reaction = {
  emoji: string;
  count: number;
  userIds: string[];
};

type Props = {
  message: Message & {
    reactions?: Reaction[];
    replyTo?: Message | null;
    changed?: boolean;
  };
  isCurrentUser: boolean;
  sender: User;
  onReply: (msg: Message) => void;
  onPin: (msg: Message) => void;
  onCopy: (msg: Message) => void;
  onForward: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onDeleteForMe: (msg: Message) => void;
  onSelect: (msg: Message) => void;
  onReact: (msg: Message, reaction: string) => void;
  onEdit: (msg: Message) => void;
  onJumpToMessage?: (id: string) => void;
  containerRef?: (el: HTMLDivElement | null) => void;
  highlighted?: boolean;
  isSelected?: boolean;
  showSelectCircle?: boolean;
  userReactions: Set<string>;
  isPinned: boolean; // новый пропс
};

export default function ChatMessage({
  message,
  isCurrentUser,
  sender,
  onReply,
  onPin,
  onCopy,
  onForward,
  onDelete,
  onDeleteForMe,
  onSelect,
  onReact,
  onEdit,
  onJumpToMessage,
  containerRef,
  highlighted,
  isSelected,
  showSelectCircle = false,
  userReactions,
  isPinned,
}: Props) {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    left: 0,
    top: 0,
    position: "fixed",
    zIndex: 9999,
  });
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showDeleteChoice, setShowDeleteChoice] = useState(false);
  const deleteChoiceMenuRef = useRef<HTMLDivElement | null>(null);

  const EDGE_PADDING = 32;
  const ACTIONS_MENU_WIDTH = 192;
  const REACTIONS_MENU_WIDTH = ACTIONS_MENU_WIDTH + 80;
  const RIGHT_SCREEN_PADDING = 12;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (contextMenuVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [contextMenuVisible]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        contextMenuVisible &&
        internalContainerRef.current &&
        !internalContainerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setContextMenuVisible(false);
        setShowDeleteChoice(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [contextMenuVisible]);

  const closeMenu = () => {
    setContextMenuVisible(false);
    setShowDeleteChoice(false);
  };

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const clickX = e.clientX;
    const clickY = e.clientY;

    setMenuStyle({
      position: "fixed",
      left: clickX,
      top: clickY,
      width: ACTIONS_MENU_WIDTH,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      zIndex: 9999,
    });

    setContextMenuVisible(true);
  };

  useEffect(() => {
    if (contextMenuVisible && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();

      let newLeft = menuStyle.left as number;
      let newTop = menuStyle.top as number;

      if (rect.right > window.innerWidth) {
        newLeft = Math.max(
          EDGE_PADDING,
          window.innerWidth - rect.width - EDGE_PADDING - RIGHT_SCREEN_PADDING
        );
      }
      if (rect.bottom > window.innerHeight) {
        newTop = Math.max(
          EDGE_PADDING,
          window.innerHeight - rect.height - EDGE_PADDING
        );
      }
      if (rect.left < 0) {
        newLeft = EDGE_PADDING;
      }
      if (rect.top < 0) {
        newTop = EDGE_PADDING;
      }

      if (newLeft !== menuStyle.left || newTop !== menuStyle.top) {
        setMenuStyle((prev) => ({
          ...prev,
          left: newLeft,
          top: newTop,
        }));
      }
    }
  }, [contextMenuVisible]);

  useEffect(() => {
    if (showDeleteChoice && deleteChoiceMenuRef.current) {
      const menu = deleteChoiceMenuRef.current;
      const rect = menu.getBoundingClientRect();

      let offsetX = 0;
      let offsetY = 0;

      if (rect.right > window.innerWidth) {
        offsetX = -rect.width - RIGHT_SCREEN_PADDING;
      } else {
        offsetX = 0;
      }

      if (rect.bottom > window.innerHeight) {
        offsetY = window.innerHeight - rect.bottom - RIGHT_SCREEN_PADDING;
      }

      menu.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  }, [showDeleteChoice]);

  const trimReplyText = (text: string, maxLength = 30) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <>
      <div
        ref={(el) => {
          internalContainerRef.current = el;
          if (containerRef) containerRef(el);
        }}
        className={clsx(
          "flex gap-2 my-2 select-text transition-colors duration-300 relative",
          {
            "bg-gray-300 dark:bg-gray-700": highlighted || isSelected,
            "justify-end": isCurrentUser,
            "justify-start": !isCurrentUser,
          }
        )}
      >
        {showSelectCircle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(message);
            }}
            aria-label={isSelected ? "Deselect message" : "Select message"}
            type="button"
            className={clsx(
              "absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center",
              {
                "bg-blue-600 border-blue-600": isSelected,
                "hover:border-blue-500": !isSelected,
                "cursor-pointer": true,
              }
            )}
            style={{ zIndex: 10 }}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-white pointer-events-none" />
            )}
          </button>
        )}

        {!isCurrentUser &&
          (sender.avatar ? (
            <img
              src={sender.avatar}
              alt={sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
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
          ))}

        <div
          onContextMenu={openContextMenu}
          className={clsx(
            "flex flex-col gap-0.5 max-w-sm cursor-context-menu relative",
            {
              "items-end": isCurrentUser,
              "items-start": !isCurrentUser,
            }
          )}
          style={{ marginLeft: showSelectCircle ? 32 : undefined }}
        >
          {message.replyTo && (
            <div
              className={clsx(
                "mb-1 px-3 py-1 rounded-l-md rounded-tr-md text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer select-none",
                isCurrentUser ? "text-right" : "text-left"
              )}
              onClick={() => {
                if (onJumpToMessage) onJumpToMessage(message.replyTo!.id);
              }}
              title="Jump to replied message"
            >
              <strong>Reply to:</strong>{" "}
              {message.replyTo.text
                ? trimReplyText(message.replyTo.text, 30)
                : message.replyTo.attachments?.length
                ? `Attachment${
                    message.replyTo.attachments.length > 1 ? "s" : ""
                  }`
                : message.replyTo.location
                ? "Location"
                : ""}
            </div>
          )}

          <div
            className={clsx(
              "px-4 py-2 rounded-2xl text-sm shadow-sm relative",
              isCurrentUser
                ? "bg-emerald-400 text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                : "bg-gray-100 dark:bg-[#1a1f2b] text-gray-900 dark:text-white rounded-tr-2xl rounded-br-2xl rounded-tl-2xl",
              { "pr-8": isPinned } // отступ справа под иконку
            )}
          >
            {isPinned && (
              <span
                className="absolute right-2 top-[0.6rem] text-black"
                title="Pinned message"
                aria-label="Pinned message"
                style={{ transform: "translateY(2px)" }}
              >
                <Pin width={14} height={14} />
              </span>
            )}

            {message.text && (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}

            {message.changed && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1 select-none">
                Changed
              </p>
            )}

            {message.attachments?.map((att, idx) =>
              att.type.startsWith("image") ? (
                <img
                  key={idx}
                  src={att.url}
                  alt={att.name}
                  className="mt-2 max-w-xs rounded-lg border dark:border-gray-700 cursor-pointer"
                  onClick={() => setPreviewImage(att.url)}
                />
              ) : (
                <a
                  key={idx}
                  href={att.url}
                  download
                  className="block mt-2 text-blue-500 underline"
                >
                  📎 {att.name}
                </a>
              )
            )}

            {message.location && (
              <a
                href={`https://maps.google.com/?q=${message.location}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-500 underline"
              >
                📍 Open location
              </a>
            )}

            {message.reactions && message.reactions.length > 0 && (
              <div className="absolute bottom-0 right-0 translate-y-1/2 flex gap-1">
                {message.reactions.map((r) => {
                  const reactionKey = `${message.id}_${r.emoji}`;
                  const isActive = userReactions.has(reactionKey);

                  return (
                    <button
                      key={r.emoji}
                      onClick={() => onReact(message, r.emoji)}
                      title={`React with ${r.emoji}`}
                      type="button"
                      className={`flex items-center px-2 py-0.5 rounded-full text-xs select-none shadow
                        ${
                          isActive
                            ? "bg-emerald-400 dark:bg-emerald-600 text-white"
                            : "bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                      <span>{r.emoji}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-1 mt-1 select-none text-xs font-mono text-gray-500">
            <span>{message.time}</span>
            {isCurrentUser && (
              <>
                {message.status === "seen" ? (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {contextMenuVisible && (
        <>
          <div
            onClick={closeMenu}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              zIndex: 9998,
              cursor: "default",
            }}
          />
          <div
            ref={menuRef}
            style={menuStyle}
            aria-label="Message context menu"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="flex justify-between px-6 py-3 bg-gray-200 dark:bg-[#222831] rounded-full shadow-inner"
              style={{ width: REACTIONS_MENU_WIDTH }}
            >
              {["❤️", "🤣", "🥰", "👍", "😭", "🔥"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onReact(message, r);
                    closeMenu();
                  }}
                  className="text-xl hover:bg-gray-300 dark:hover:bg-gray-700 rounded p-1 flex-shrink-0"
                  aria-label={`React with ${r}`}
                  type="button"
                  style={{ lineHeight: 1 }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-2 w-48 flex flex-col gap-1 relative">
              <button
                onClick={() => {
                  onReply(message);
                  closeMenu();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <MessageCircle className="w-5 h-5" />
                Reply
              </button>

              <button
                onClick={() => {
                  onPin(message);
                  closeMenu();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <Pin
                  className={clsx("w-5 h-5", {
                    "line-through text-red-500": isPinned,
                    "text-gray-700 dark:text-gray-300": !isPinned,
                  })}
                />
                {isPinned ? "Unpin" : "Pin"}
              </button>

              <button
                onClick={() => {
                  if (message.text) {
                    navigator.clipboard.writeText(message.text).catch(() => {});
                  }
                  closeMenu();
                  onCopy(message);
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <Copy className="w-5 h-5" />
                Copy Text
              </button>

              <button
                onClick={() => {
                  onForward(message);
                  closeMenu();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <Share className="w-5 h-5" />
                Forward
              </button>

              <button
                onClick={() => {
                  onEdit(message);
                  closeMenu();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <EditIcon className="w-5 h-5" />
                Edit Message
              </button>

              <div className="relative w-full">
                <button
                  onClick={() => setShowDeleteChoice((prev) => !prev)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                  type="button"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>

                {showDeleteChoice && (
                  <div
                    ref={deleteChoiceMenuRef}
                    className="absolute left-full top-0 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-2 w-48 flex flex-col gap-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                    style={{ transform: "translate(0, 0)" }}
                  >
                    <button
                      onClick={() => {
                        onDelete(message);
                        setShowDeleteChoice(false);
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                      type="button"
                    >
                      Delete for All
                    </button>
                    <button
                      onClick={() => {
                        onDeleteForMe(message);
                        setShowDeleteChoice(false);
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                      type="button"
                    >
                      Delete for Me
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onSelect(message);
                  closeMenu();
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded w-full text-left"
                type="button"
              >
                <CheckSquare className="w-5 h-5" />
                Select
              </button>
            </div>
          </div>
        </>
      )}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)} // клик по затемнению закрывает
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // остановить всплытие, чтобы не закрывать оверлей дважды
              setPreviewImage(null); // закрыть превью
            }}
            aria-label="Close preview"
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition z-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // клик по фото не закрывает
          />
        </div>
      )}
    </>
  );
}
