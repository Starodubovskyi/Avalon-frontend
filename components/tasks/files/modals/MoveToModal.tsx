"use client";

import Modal from "@/components/tasks/shared/Modal";
import { useMemo, useState } from "react";
import { useFilesStore, type Folder as FolderRec } from "../useFilesStore";
import { Folder as FolderIcon, Plus } from "lucide-react";

export default function MoveToModal({
  open,
  ids,
  onClose,
}: {
  open: boolean;
  ids: string[];
  onClose: () => void;
}) {
  const store = useFilesStore();
  const [selected, setSelected] = useState<string | null>(
    store.currentFolderId ?? null
  );
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const tree = useMemo(
    () => buildTree(Object.values(store.folders)),
    [store.folders]
  );

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-[#0f0f0f] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Move to…
        </div>

        <div className="mt-3 max-h-[320px] overflow-y-auto rounded-xl border border-gray-100 p-2 dark:border-white/10 dark:bg-white/[0.02]">
          <FolderRow
            name="All files"
            id={null}
            selected={selected === null}
            onSelect={setSelected}
            depth={0}
          />
          {tree.map((n) => (
            <TreeNode
              key={n.id}
              node={n}
              selected={selected}
              onSelect={setSelected}
              depth={0}
            />
          ))}
        </div>

        <div className="mt-3">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
            >
              <Plus className="h-4 w-4" /> New folder here
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              />
              <button
                onClick={() => {
                  if (!newName.trim()) return;
                  const id = store.createFolder(newName.trim(), selected);
                  setNewName("");
                  setCreating(false);
                  setSelected(id);
                }}
                className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              store.moveItems(ids, selected);
              onClose();
            }}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg_white dark:text-black"
          >
            Move here
          </button>
        </div>
      </div>
    </Modal>
  );
}

function buildTree(folders: FolderRec[]) {
  const byParent: Record<string, FolderRec[]> = {};
  folders.forEach((f) => {
    const p = f.parentId ?? "__root__";
    (byParent[p] ||= []).push(f);
  });
  const walk = (parentId: string | null): TreeNodeData[] =>
    (byParent[parentId ?? "__root__"] || [])
      .filter((f) => f.id !== "root")
      .map((f) => ({ ...f, children: walk(f.id) }));
  return walk(null);
}

type TreeNodeData = FolderRec & { children: TreeNodeData[] };

function TreeNode({
  node,
  selected,
  onSelect,
  depth,
}: {
  node: TreeNodeData;
  selected: string | null;
  onSelect: (id: string | null) => void;
  depth: number;
}) {
  return (
    <>
      <FolderRow
        name={node.name}
        id={node.id}
        selected={selected === node.id}
        onSelect={onSelect}
        depth={depth}
      />
      {node.children.map((c) => (
        <TreeNode
          key={c.id}
          node={c}
          selected={selected}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

function FolderRow({
  name,
  id,
  selected,
  onSelect,
  depth,
}: {
  name: string;
  id: string | null;
  selected: boolean;
  onSelect: (id: string | null) => void;
  depth: number;
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/10 ${
        selected ? "bg-gray-100 dark:bg-white/10" : ""
      }`}
      style={{ paddingLeft: 8 + depth * 16 }}
    >
      <FolderIcon className="h-4 w-4 text-amber-500" />
      <span className="truncate">{name}</span>
    </button>
  );
}
