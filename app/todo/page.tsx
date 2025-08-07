"use client"
import React from "react"

import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState, useEffect, useRef } from "react"
import { Plus, Edit, Trash2, CheckSquare, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import clsx from "clsx"

const STATUSES = [
  { id: "todo", label: "To Do", color: "bg-blue-100 border-blue-300", dot: "bg-blue-500" },
  { id: "inprogress", label: "In Progress", color: "bg-yellow-100 border-yellow-300", dot: "bg-yellow-400" },
  { id: "done", label: "Done", color: "bg-green-100 border-green-300", dot: "bg-green-500" },
]

type Task = {
  id: string
  text: string
  status: string
}

function KanbanCard({
  task,
  index,
  total,
  onEdit,
  onDelete,
  onComplete,
  onMove,
  editingId,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
}: {
  task: Task
  index: number
  total: number
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onMove: (dir: "up" | "down", t: Task) => void
  editingId: string | null
  editText: string
  setEditText: (t: string) => void
  saveEdit: (id: string) => void
  cancelEdit: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: "grab",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "flex items-center group gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 mb-3 shadow-sm hover:shadow-lg transition",
        task.status === "done" && "bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-green-900/60 dark:to-green-900/30 border-green-400 dark:border-green-700 opacity-85"
      )}
    >
      <div className="flex flex-col items-center mr-2 gap-1">
        <button
          className={clsx(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition",
            index === 0 && "opacity-30 pointer-events-none"
          )}
          onClick={() => onMove("up", task)}
          disabled={index === 0}
          tabIndex={-1}
          title="Move up"
          type="button"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          className={clsx(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition",
            index === total - 1 && "opacity-30 pointer-events-none"
          )}
          onClick={() => onMove("down", task)}
          disabled={index === total - 1}
          tabIndex={-1}
          title="Move down"
          type="button"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
      {editingId === task.id ? (
        <>
          <input
            className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            value={editText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter"
                ? saveEdit(task.id)
                : e.key === "Escape"
                ? cancelEdit()
                : undefined
            }
            autoFocus
          />
          <button
            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
            onClick={() => saveEdit(task.id)}
            aria-label="Save"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            onClick={cancelEdit}
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <span
            className={clsx(
              "flex-1 select-text text-base transition-all cursor-pointer",
              task.status === "done" && "line-through text-gray-400 dark:text-gray-500"
            )}
            onDoubleClick={() => onEdit(task)}
            title="Double click to edit"
          >
            {task.text}
          </span>
          {task.status !== "done" && (
            <button
              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full opacity-0 group-hover:opacity-100 transition"
              onClick={() => onComplete(task.id)}
              aria-label="Mark as done"
              title="Mark as done"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          )}
          <button
            className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full opacity-0 group-hover:opacity-100 transition"
            onClick={() => onEdit(task)}
            aria-label="Edit"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full opacity-0 group-hover:opacity-100 transition"
            onClick={() => onDelete(task.id)}
            aria-label="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )
}

function reorder(array: Task[], from: number, to: number) {
  const a = [...array]
  const [item] = a.splice(from, 1)
  a.splice(to, 0, item)
  return a
}

export default function KanbanTodo() {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    todo: [],
    inprogress: [],
    done: [],
  })
  const [input, setInput] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("kanban-tasks-v3")
    if (stored) setTasks(JSON.parse(stored))
  }, [])
  useEffect(() => {
    localStorage.setItem("kanban-tasks-v3", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (input.trim().length === 0) return
    setTasks(prev => ({
      ...prev,
      todo: [
        ...prev.todo,
        { id: Date.now().toString(), text: input, status: "todo" },
      ],
    }))
    setInput("")
    inputRef.current?.focus()
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }
  const saveEdit = (id: string) => {
    setTasks(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.map(t => (t.id === id ? { ...t, text: editText } : t)),
        ])
      ) as Record<string, Task[]>
    )
    setEditingId(null)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const deleteTask = (id: string) => {
    setTasks(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.filter(t => t.id !== id),
        ])
      ) as Record<string, Task[]>
    )
  }

  const completeTask = (id: string) => {
    setTasks(prev => {
      let completedTask: Task | undefined
      const next = Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.filter(t => {
            if (t.id === id) completedTask = t
            return t.id !== id
          }),
        ])
      ) as Record<string, Task[]>
      if (completedTask) {
        completedTask.status = "done"
        next.done = [...next.done, completedTask]
      }
      return next
    })
  }

  const moveTask = (direction: "up" | "down", task: Task) => {
    setTasks(prev => {
      const colArr = [...prev[task.status]]
      const idx = colArr.findIndex(t => t.id === task.id)
      if (
        (direction === "up" && idx === 0) ||
        (direction === "down" && idx === colArr.length - 1)
      )
        return prev
      const newArr = reorder(colArr, idx, direction === "up" ? idx - 1 : idx + 1)
      return { ...prev, [task.status]: newArr }
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const findTaskById = (id: string): [Task | undefined, string] => {
    for (const col of STATUSES.map(s => s.id)) {
      const task = tasks[col].find(t => t.id === id)
      if (task) return [task, col]
    }
    return [undefined, ""]
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const [task, fromCol] = findTaskById(String(active.id))
    if (!task) return

    let overCol = fromCol
    let newIdx = -1

    if (STATUSES.find(s => s.id === over.id)) {
      overCol = String(over.id)
      newIdx = tasks[overCol].length 
    } else {
      const [, col] = findTaskById(String(over.id))
      overCol = col
      newIdx = tasks[overCol].findIndex(t => t.id === over.id)
    }

    setTasks(prev => {
      let newTasks = { ...prev }
      let fromArr = newTasks[fromCol].filter(t => t.id !== task.id)
      newTasks[fromCol] = fromArr

      let toArr = [...newTasks[overCol]]
      if (fromCol === overCol) {
        const oldIdx = prev[fromCol].findIndex(t => t.id === active.id)
        newTasks[fromCol] = arrayMove(prev[fromCol], oldIdx, newIdx)
      } else {
        toArr.splice(newIdx, 0, { ...task, status: overCol })
        newTasks[overCol] = toArr
      }
      return newTasks
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-green-50 to-yellow-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-start px-2 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-10 drop-shadow-sm">
        <CheckSquare className="w-9 h-9 text-blue-600 dark:text-blue-400" />
        My Kanban Board
      </h1>
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 items-stretch">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={onDragEnd}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        >
          {STATUSES.map(col => (
            <SortableContext
              key={col.id}
              id={col.id}
              items={tasks[col.id].map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={clsx(
                  "flex-1 min-w-[290px] rounded-3xl border-2 shadow-xl flex flex-col px-5 py-5",
                  col.color
                )}
                id={col.id}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={clsx("w-3 h-3 rounded-full", col.dot)} />
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">{col.label}</h2>
                  <span
                    className={clsx(
                      "ml-auto text-xs font-bold",
                      col.id === "todo" && "text-blue-500",
                      col.id === "inprogress" && "text-yellow-500",
                      col.id === "done" && "text-green-600"
                    )}
                  >
                    {tasks[col.id].length}
                  </span>
                </div>
                {col.id === "todo" && (
                  <div className="flex gap-2 mb-5">
                    <input
                      ref={inputRef}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none text-base shadow-inner"
                      type="text"
                      placeholder="Add task..."
                      value={input}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") addTask()
                      }}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition active:scale-95 flex items-center gap-2 font-semibold"
                      onClick={addTask}
                      aria-label="Add task"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col flex-1 min-h-[40px]">
                  {tasks[col.id].length === 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                      {col.id === "todo" && "No tasks yet"}
                      {col.id === "inprogress" && "Nothing in progress"}
                      {col.id === "done" && "No tasks done"}
                    </div>
                  )}
                  {tasks[col.id].map((task, idx) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      index={idx}
                      total={tasks[col.id].length}
                      onEdit={startEdit}
                      onDelete={deleteTask}
                      onComplete={completeTask}
                      editingId={editingId}
                      editText={editText}
                      setEditText={setEditText}
                      saveEdit={saveEdit}
                      cancelEdit={cancelEdit}
                      onMove={moveTask}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          ))}
          <DragOverlay>
            {activeId && (() => {
              const [task] = findTaskById(activeId)
              return task ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border font-semibold text-gray-900 dark:text-white min-w-[180px] max-w-[250px] text-base pointer-events-none">
                  {task.text}
                </div>
              ) : null
            })()}
          </DragOverlay>
        </DndContext>
      </div>
      <div className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        Drag tasks between columns or sort with arrows.
      </div>
    </div>
  )
}
