import { Message, User } from "../types/chat";
import clsx from "clsx";

type Props = {
  message: Message;
  isCurrentUser: boolean;
  sender: User;
};

export default function ChatMessage({ message, isCurrentUser, sender }: Props) {
  return (
    <div
      className={clsx("flex gap-2 my-2", {
        "justify-end": isCurrentUser,
        "justify-start": !isCurrentUser,
      })}
    >
      {/* Аватар */}
      {!isCurrentUser && (
        sender.avatar ? (
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
        )
      )}

      <div
        className={clsx(
          "max-w-sm px-4 py-2 rounded-2xl text-sm shadow-md",
          isCurrentUser
            ? "bg-emerald-500 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-[#1a1f2b] text-gray-900 dark:text-white rounded-bl-none"
        )}
      >
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        {message.attachments?.map((att, idx) =>
          att.type === "image" ? (
            <img
              key={idx}
              src={att.url}
              alt={att.name}
              className="mt-2 max-w-xs rounded-lg border dark:border-gray-700"
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

        <span className="flex items-center justify-end gap-1 text-[10px] text-white/80 dark:text-gray-400 mt-1">
          {message.time}
        </span>
      </div>
    </div>
  );
}
