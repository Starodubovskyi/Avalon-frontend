"use client";

import { useRef, useState, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Paperclip, Smile, Send, ImageIcon, MapPin, X } from "lucide-react";
import { Message } from "../types/chat";

type Props = {
  onSend: (message: string, attachments?: File[], location?: string) => void;
  onReactToLastMessage?: (reaction: string) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  inputText?: string;
  setInputText?: (text: string) => void;
};

export default function ChatInput({
  onSend,
  onReactToLastMessage,
  replyTo,
  onCancelReply,
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
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(inputText);
  }, [inputText]);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    if (onReactToLastMessage) {
      onReactToLastMessage(emoji.emoji);
      setShowEmoji(false);
    } else {
      if (setInputText) setInputText(text + emoji.emoji);
      setText((prev) => prev + emoji.emoji);
    }
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0 && !location) return;

    onSend(text.trim(), files, location ?? undefined);

    if (setInputText) setInputText("");
    setText("");
    setFiles([]);
    setLocation(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation(`https://maps.google.com/?q=${latitude},${longitude}`);
      setShowAttachmentMenu(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const onClickPhotoVideo = () => {
    imageInputRef.current?.click();
    setShowAttachmentMenu(false);
  };

  const onClickFile = () => {
    fileInputRef.current?.click();
    setShowAttachmentMenu(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        showAttachmentMenu &&
        attachmentMenuRef.current &&
        attachmentButtonRef.current &&
        !attachmentMenuRef.current.contains(target) &&
        !attachmentButtonRef.current.contains(target)
      ) {
        setShowAttachmentMenu(false);
      }

      if (
        showEmoji &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(target) &&
        !emojiButtonRef.current.contains(target)
      ) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachmentMenu, showEmoji]);

  const trimReplyText = (val: string, max = 60) =>
    val.length > max ? val.slice(0, max) + "..." : val;

  return (
    <div className="relative z-20 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-[#0d1117]">
      {showEmoji && (
        <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
        </div>
      )}

      {(files.length > 0 || location) && (
        <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
          {files.map((file: File, idx: number) => (
            <div
              key={`${file.name}-${idx}`}
              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
              />
            </div>
          ))}
          {location && (
            <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
              <a href={location} target="_blank" rel="noopener noreferrer" className="underline">
                Location
              </a>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setLocation(null)} />
            </div>
          )}
        </div>
      )}

      {replyTo && (
        <div className="mb-2 flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Replying to:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {replyTo.text
                ? trimReplyText(replyTo.text)
                : replyTo.attachments?.length
                ? `Attachment${replyTo.attachments.length > 1 ? "s" : ""}`
                : replyTo.location
                ? "Location"
                : ""}
            </p>
          </div>
          {onCancelReply && (
            <button
              className="ml-3 text-gray-500 hover:text-red-500"
              onClick={onCancelReply}
              type="button"
              aria-label="Cancel reply"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* нижняя панель без внешних сдвигов, всё держится ровно */}
      <div className="flex items-center gap-2">
        <button
          ref={emojiButtonRef}
          onClick={() => setShowEmoji((prev) => !prev)}
          aria-label="Emoji picker"
          type="button"
        >
          <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-emerald-500" />
        </button>

        <button
          ref={attachmentButtonRef}
          onClick={() => setShowAttachmentMenu((prev) => !prev)}
          className="text-gray-500 dark:text-gray-400 hover:text-emerald-500"
          aria-label="Attachment menu"
          type="button"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {showAttachmentMenu && (
          <div
            ref={attachmentMenuRef}
            className="absolute bottom-full mb-2 left-12 z-50 w-44 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-2 flex flex-col gap-2"
          >
            <button
              onClick={onClickPhotoVideo}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              type="button"
            >
              <ImageIcon className="w-5 h-5 text-pink-500" />
              Photo/Video
            </button>
            <button
              onClick={onClickFile}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              type="button"
            >
              <Paperclip className="w-5 h-5 text-blue-500" />
              File
            </button>
            <button
              onClick={handleLocation}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              type="button"
            >
              <MapPin className="w-5 h-5 text-indigo-500" />
              Location
            </button>
          </div>
        )}

        {/* Инпут (сужен на мобиле) + Кнопка отправки ВНУТРИ */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center bg-gray-100 dark:bg-[#1a1f2b] border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5 flex-1 min-w-0 max-w-[80%] sm:max-w-full">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (setInputText) setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
            />
            {/* SEND ВНУТРИ ИНПУТА */}
            <button
              onClick={handleSend}
              className="ml-2 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
              aria-label="Send message"
              type="button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* скрытые инпуты файлов */}
        <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileChange} />
        <input type="file" hidden accept="image/*" multiple ref={imageInputRef} onChange={handleImageChange} />
      </div>
    </div>
  );
}
