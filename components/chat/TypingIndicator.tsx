export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 ml-2 w-fit bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm shadow-sm">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200" />
    </div>
  );
}
