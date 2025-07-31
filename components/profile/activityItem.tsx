import { FaTag } from "react-icons/fa";
import { BiLinkExternal } from "react-icons/bi";
import { FiPlay } from "react-icons/fi";

interface Props {
  icon: "tag" | "link" | "session";
  title: string;
  time: string;
  description: React.ReactNode;
  details: string;
}

export const ActivityItem = ({
  icon,
  title,
  time,
  description,
  details,
}: Props) => {
  const iconMap = {
    tag: <FaTag className="text-blue-600 dark:text-blue-400" />,
    link: <BiLinkExternal className="text-blue-600 dark:text-blue-400" />,
    session: <FiPlay className="text-blue-600 dark:text-blue-400" />,
  };

  return (
    <div className="flex items-start space-x-4 border-b pb-4">
      <div className="text-xl">{iconMap[icon]}</div>
      <div className="flex-1">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 font-medium">
          <span>{title}</span>
          <span>{time}</span>
        </div>
        <div className="text-gray-800 dark:text-white text-sm mt-1">
          {description}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {details}
        </div>
      </div>
    </div>
  );
};
