export const DateSeparator = ({ date }: { date: string }) => {
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm font-semibold mt-6">
      <div className="w-8 h-8 rounded-full border text-center mr-2 text-blue-600 dark:text-blue-400 font-bold">
        {date === "Monday" ? "5" : "4"}
      </div>
      {date}
      <span className="ml-2 text-gray-400 dark:text-gray-500 text-xs">
        Dec. 2019
      </span>
    </div>
  );
};
