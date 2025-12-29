"use client";

import { useRef, useState, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  Paperclip,
  Smile,
  Send,
  Image as ImageIcon,
  MapPin,
  X,
  Edit3,
} from "lucide-react";
import { Message } from "../types/chat";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type Props = {
  onSend: (message: string, attachments?: File[], location?: string) => void;
  onReactToLastMessage?: (reaction: string) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  // Новые пропсы для редактирования
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  inputText?: string;
  setInputText?: (text: string) => void;
};

export default function ChatInput({
  onSend,
  onReactToLastMessage,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  inputText = "",
  setInputText,
}: Props) {
  const [text, setText] = useState(inputText);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(inputText);
  }, [inputText]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showAttachmentMenu &&
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node) &&
        !attachmentButtonRef.current?.contains(event.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
      if (
        showEmoji &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current?.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachmentMenu, showEmoji]);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    if (onReactToLastMessage) {
      onReactToLastMessage(emoji.emoji);
      setShowEmoji(false);
    } else {
      const newText = text + emoji.emoji;
      if (setInputText) setInputText(newText);
      setText(newText);
    }
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0 && !location) return;
    onSend(text.trim(), files, location ?? undefined);
    // При отправке очищаем поля, только если это не редактирование (логику очистки при редактировании лучше контролировать извне или оставить как есть, если onSend обрабатывает обновление)
    if (!editingMessage) {
      if (setInputText) setInputText("");
      else setText("");
      setFiles([]);
      setLocation(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    setShowAttachmentMenu(false);
  };

  const handleLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(
        `https://maps.google.com/?q=$${pos.coords.latitude},${pos.coords.longitude}`
      );
      setShowAttachmentMenu(false);
    });
  };

  return (
    <div className="relative z-20 border-t border-gray-100 dark:border-white/5 px-4 py-3 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md">
      {/* Edit Preview (Как в Telegram) */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl mb-2 border-l-4 border-blue-500 animate-in slide-in-from-bottom-2 fade-in">
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Edit3 size={12} /> Edit Message
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs sm:max-w-md">
              {editingMessage.text || "Attachment"}
            </p>
          </div>
          <button
            onClick={onCancelEdit}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Reply Preview (Скрываем, если редактируем, так как обычно это взаимоисключающие действия) */}
      {replyTo && !editingMessage && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl mb-2 border-l-4 border-gray-400">
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
              Replying to
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">
              {replyTo.text || "Attachment"}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attachments Preview */}
      {(files.length > 0 || location) && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-xs"
            >
              <span className="truncate max-w-[100px]">{f.name}</span>
              <button
                onClick={() =>
                  setFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {location && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg text-xs text-green-700 dark:text-green-300">
              <MapPin size={12} /> <span>Location attached</span>
              <button onClick={() => setLocation(null)}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        <button
          ref={emojiButtonRef}
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-3 text-gray-500 hover:text-yellow-500 transition-colors"
        >
          <Smile size={24} />
        </button>
        <button
          ref={attachmentButtonRef}
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          className="p-3 text-gray-500 hover:text-blue-500 transition-colors"
        >
          <Paperclip size={24} />
        </button>

        <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center px-4 border border-transparent focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (setInputText) setInputText(e.target.value);
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleSend())
            }
            placeholder="Message..."
            className="flex-1 bg-transparent py-3 outline-none text-gray-900 dark:text-white placeholder-gray-500"
            autoFocus={!!editingMessage} // Автофокус при редактировании
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() && files.length === 0 && !location}
          className={clsx(
            "p-3 rounded-full text-white shadow-lg transition-transform active:scale-95",
            GRADIENT_BG,
            !text.trim() && files.length === 0 && !location
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-blue-500/40"
          )}
        >
          {editingMessage ? (
            <div className="p-0.5">
              <Edit3 size={18} />
            </div>
          ) : (
            <Send size={20} className="ml-0.5" />
          )}
        </button>
      </div>

      {/* Popups */}
      {showEmoji && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden"
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.AUTO} />
        </div>
      )}

      {showAttachmentMenu && (
        <div
          ref={attachmentMenuRef}
          className="absolute bottom-20 left-16 bg-white dark:bg-[#1e2329] p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex flex-col gap-1 min-w-[160px] animate-in slide-in-from-bottom-5 fade-in"
        >
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
          >
            <ImageIcon className="text-pink-500" size={18} /> Photo/Video
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
          >
            <Paperclip className="text-blue-500" size={18} /> Document
          </button>
          <button
            onClick={handleLocation}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
          >
            <MapPin className="text-green-500" size={18} /> Location
          </button>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}
