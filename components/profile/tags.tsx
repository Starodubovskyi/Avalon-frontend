import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiPlus } from "react-icons/fi";

const TagsContent = () => {
  const [tags, setTags] = useState([
    { name: "Web-desktop", color: "#fef3c7", text: "#92400e" },
    { name: "Newsletter", color: "#fee2e2", text: "#991b1b" },
    { name: "GoodCustomer", color: "#dbeafe", text: "#1d4ed8" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [bgColor, setBgColor] = useState("#dbeafe");
  const [textColor, setTextColor] = useState("#1d4ed8");

  const addTag = () => {
    if (!tagName.trim()) return;
    setTags([
      ...tags,
      { name: tagName.trim(), color: bgColor, text: textColor },
    ]);
    setTagName("");
    setIsOpen(false);
  };

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-4">Tags</h3>

      {/* Теги */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-md text-sm font-medium"
            style={{ backgroundColor: tag.color, color: tag.text }}
          >
            {tag.name}
          </span>
        ))}

        {/* Кнопка "+" */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-7 h-7 border border-blue-300 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-100 transition"
        >
          <FiPlus size={16} />
        </button>
      </div>

      {/* Модальное окно */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-sm shadow-xl space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Add new tag
            </Dialog.Title>

            <input
              type="text"
              placeholder="Tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
            />

            <div className="flex gap-4 items-center">
              <label className="text-sm">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <label className="text-sm">Text:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addTag}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Tag
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default TagsContent;
