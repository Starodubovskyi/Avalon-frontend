"use client";

import { useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  Paperclip,
  Smile,
  Send,
  ImageIcon,
  MapPin,
  X,
} from "lucide-react";

type Props = {
  onSend: (message: string, attachments?: File[], location?: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    setText((prev) => prev + emoji.emoji);
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0 && !location) return;

    onSend(text.trim(), files, location ?? undefined);
    setText("");
    setFiles([]);
    setLocation(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
  setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])
]);
}

  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])
]);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation(`https://maps.google.com/?q=${latitude},${longitude}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="relative border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-[#0d1117]">
      {showEmoji && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
        </div>
      )}

      {/* Прикрепленные файлы */}
      {(files.length > 0 || location) && (
        <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"
            >
              <span className="truncate max-w-[100px]">{file.name}</span>
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            </div>
          ))}
          {location && (
            <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
              <a
                href={location}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Location
              </a>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setLocation(null)} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Левая панель: иконки */}
        <button onClick={() => setShowEmoji((prev) => !prev)}>
          <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-emerald-500" />
        </button>
        <button onClick={() => fileInputRef.current?.click()}>
          <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-500" />
        </button>
        <button onClick={() => imageInputRef.current?.click()}>
          <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-pink-500" />
        </button>
        <button onClick={handleLocation}>
          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-indigo-500" />
        </button>

        {/* Ввод текста */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1a1f2b] border border-gray-300 dark:border-gray-600 text-sm focus:outline-none"
        />

        {/* Отправка */}
        <button
          onClick={handleSend}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
        >
          <Send className="w-4 h-4" />
        </button>

        {/* Скрытые инпуты */}
        <input
          type="file"
          hidden
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <input
          type="file"
          hidden
          accept="image/*"
          multiple
          ref={imageInputRef}
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
}
