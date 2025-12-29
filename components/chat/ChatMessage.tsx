"use client";

import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
  isPinned: boolean;
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
    opacity: 0, // Скрываем до расчета позиции
  });
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showDeleteChoice, setShowDeleteChoice] = useState(false);
  const deleteChoiceMenuRef = useRef<HTMLDivElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (contextMenuVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [contextMenuVisible]);

  // Закрытие при клике вне
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

  // --- ИСПРАВЛЕННАЯ ЛОГИКА ПОЗИЦИОНИРОВАНИЯ ---
  useLayoutEffect(() => {
    if (contextMenuVisible && menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const rect = menu.getBoundingClientRect();

      let newLeft = menuStyle.left as number;
      let newTop = menuStyle.top as number;

      const padding = 16; // Отступ от края экрана

      // Проверка правой границы
      if (newLeft + rect.width > innerWidth - padding) {
        newLeft = innerWidth - rect.width - padding;
      }
      // Проверка левой границы (чтобы не ушло в минус при сдвиге влево)
      if (newLeft < padding) {
        newLeft = padding;
      }

      // Проверка нижней границы
      if (newTop + rect.height > innerHeight - padding) {
        newTop = innerHeight - rect.height - padding;
      }
      // Проверка верхней границы
      if (newTop < padding) {
        newTop = padding;
      }

      // Применяем рассчитанные координаты и показываем меню
      setMenuStyle((prev) => ({
        ...prev,
        left: newLeft,
        top: newTop,
        opacity: 1,
      }));
    }
  }, [contextMenuVisible]);

  const closeMenu = () => {
    setContextMenuVisible(false);
    setShowDeleteChoice(false);
  };

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuStyle({
      position: "fixed",
      left: e.clientX,
      top: e.clientY,
      width: 220,
      zIndex: 9999,
      opacity: 0, // Начинаем скрытым
    });
    setContextMenuVisible(true);
  };

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
          "flex gap-3 mb-1 select-text transition-all duration-300 relative group px-2",
          {
            "bg-blue-50/50 dark:bg-blue-900/20 py-2 rounded-xl":
              highlighted || isSelected,
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
            className={clsx(
              "absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10",
              isSelected
                ? `border-transparent ${GRADIENT_BG}`
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent"
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </button>
        )}

        <div
          className={clsx("flex flex-col max-w-[80%] md:max-w-[65%]", {
            "items-end": isCurrentUser,
            "items-start": !isCurrentUser,
          })}
          style={{ marginLeft: showSelectCircle ? 32 : 0 }}
        >
          {/* Reply Info */}
          {message.replyTo && (
            <div
              onClick={() => onJumpToMessage?.(message.replyTo!.id)}
              className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:opacity-80 transition-opacity bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg self-start"
            >
              <div className="w-0.5 h-3 bg-blue-500 rounded-full" />
              <span className="font-medium">Reply:</span>
              <span className="truncate max-w-[150px] italic">
                {message.replyTo.text
                  ? trimReplyText(message.replyTo.text)
                  : "Attachment"}
              </span>
            </div>
          )}

          {/* Bubble */}
          <div
            onContextMenu={openContextMenu}
            className={clsx(
              "relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed",
              isCurrentUser
                ? `${GRADIENT_BG} text-white rounded-2xl rounded-tr-sm`
                : "bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm"
            )}
          >
            {/* Pinned Icon */}
            {isPinned && (
              <Pin className="absolute -top-2 -right-2 w-5 h-5 p-1 rounded-full bg-white dark:bg-gray-800 shadow text-blue-500" />
            )}

            {/* Images */}
            {message.attachments?.map((att, idx) =>
              att.type.startsWith("image") ? (
                <img
                  key={idx}
                  src={att.url}
                  alt={att.name}
                  className="mb-2 max-w-full rounded-xl cursor-pointer hover:brightness-95 transition"
                  onClick={() => setPreviewImage(att.url)}
                />
              ) : (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 mb-2 bg-black/10 dark:bg-white/10 rounded-lg text-sm"
                >
                  <span>📎 {att.name}</span>
                </div>
              )
            )}

            <p className="whitespace-pre-wrap">{message.text}</p>

            {/* Footer */}
            <div
              className={clsx(
                "flex items-center justify-end gap-1 mt-1 text-[10px]",
                isCurrentUser ? "text-blue-100" : "text-gray-400"
              )}
            >
              {message.changed && <span className="italic mr-1">edited</span>}
              <span>{message.time}</span>
              {isCurrentUser &&
                (message.status === "seen" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                ))}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="absolute -bottom-3 left-2 flex gap-1">
                {message.reactions.map((r) => (
                  <div
                    key={r.emoji}
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-full px-1.5 py-0.5 text-xs flex items-center gap-1 scale-90"
                  >
                    <span>{r.emoji}</span>
                    <span className="font-bold text-gray-500">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        {!isCurrentUser && (
          <div className="flex flex-col justify-end pb-1">
            {sender.avatar ? (
              <img
                src={sender.avatar}
                className="w-8 h-8 rounded-full object-cover shadow-sm"
                alt={sender.name}
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold ${GRADIENT_BG}`}
              >
                {sender.name[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenuVisible && (
        <>
          {/* Transparent backdrop to catch clicks outside immediately */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={closeMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              closeMenu();
            }}
          />

          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* ИСПРАВЛЕНИЕ: Добавлены классы для скрытия скроллбара */}
            <div className="flex justify-between px-2 py-2 mb-1 bg-gray-50 dark:bg-white/5 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {["❤️", "🤣", "🥰", "👍", "😭", "🔥"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onReact(message, r);
                    closeMenu();
                  }}
                  className="hover:scale-125 transition text-lg px-1"
                >
                  {r}
                </button>
              ))}
            </div>

            <MenuBtn
              icon={<MessageCircle size={16} />}
              label="Reply"
              onClick={() => {
                onReply(message);
                closeMenu();
              }}
            />
            <MenuBtn
              icon={<Copy size={16} />}
              label="Copy Text"
              onClick={() => {
                if (message.text) navigator.clipboard.writeText(message.text);
                closeMenu();
                onCopy(message);
              }}
            />
            <MenuBtn
              icon={<EditIcon size={16} />}
              label="Edit"
              onClick={() => {
                onEdit(message);
                closeMenu();
              }}
            />
            <MenuBtn
              icon={<Pin size={16} />}
              label={isPinned ? "Unpin" : "Pin"}
              onClick={() => {
                onPin(message);
                closeMenu();
              }}
            />
            <MenuBtn
              icon={<Share size={16} />}
              label="Forward"
              onClick={() => {
                onForward(message);
                closeMenu();
              }}
            />
            <MenuBtn
              icon={<CheckSquare size={16} />}
              label="Select"
              onClick={() => {
                onSelect(message);
                closeMenu();
              }}
            />
            <div className="h-px bg-gray-100 dark:bg-white/10 my-1" />

            <div className="relative">
              <MenuBtn
                icon={<Trash2 size={16} />}
                label="Delete"
                color="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e: any) => {
                  e.stopPropagation();
                  setShowDeleteChoice(!showDeleteChoice);
                }}
              />

              {showDeleteChoice && (
                <div
                  ref={deleteChoiceMenuRef}
                  className="absolute right-full top-0 mr-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-1.5 w-40 z-50 animate-in slide-in-from-right-2"
                >
                  <MenuBtn
                    label="Delete for Me"
                    onClick={() => {
                      onDeleteForMe(message);
                      closeMenu();
                    }}
                  />
                  <MenuBtn
                    label="Delete for All"
                    color="text-red-500"
                    onClick={() => {
                      onDelete(message);
                      closeMenu();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
            <span className="text-xl">×</span>
          </button>
        </div>
      )}
    </>
  );
}

const MenuBtn = ({ icon, label, onClick, color }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors",
      color ||
        "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
    )}
  >
    {icon} <span>{label}</span>
  </button>
);
