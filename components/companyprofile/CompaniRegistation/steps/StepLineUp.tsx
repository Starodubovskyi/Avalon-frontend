"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { LineUpFieldDef, LineUpItem, FieldType } from "../form/types";
import { chip, inputBase, labelBase } from "../ui/classes";

type Props = {
  lineup: LineUpItem[];
  lineupDraft: LineUpItem;
  setLineupDraft: Dispatch<SetStateAction<LineUpItem>>;
  addLineupItem: () => void;
  removeLineupItem: (id: string) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}
function ensureUniqueKey(base: string, taken: Set<string>) {
  let k = base || "field";
  if (!taken.has(k)) return k;
  let n = 2;
  while (taken.has(`${k}-${n}`)) n++;
  return `${k}-${n}`;
}
function schemaSignature(schema?: LineUpFieldDef[]) {
  if (!schema || schema.length === 0) return "base-only";
  return schema.map((f) => `${f.key}:${f.type}:${f.label}`).join("|");
}
function formatByType(t: FieldType, v: any) {
  if (v === undefined || v === null || v === "") return "";
  switch (t) {
    case "number": {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n.toLocaleString() : String(v);
    }
    case "datetime":
      return String(v).replace("T", " ");
    default:
      return String(v);
  }
}

export default function StepLineUp({
  lineup,
  lineupDraft,
  setLineupDraft,
  addLineupItem,
  removeLineupItem,
}: Props) {
  const schema = useMemo<LineUpFieldDef[]>(
    () => lineupDraft.schema || [],
    [lineupDraft.schema]
  );

  const setSchema = (next: LineUpFieldDef[]) =>
    setLineupDraft((p) => ({ ...p, schema: next }));

  const setCustom = (key: string, value: any) =>
    setLineupDraft((p) => ({
      ...p,
      custom: { ...(p.custom || {}), [key]: value },
    }));

  const [showConfig, setShowConfig] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FieldType>("text");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState("");

  const addField = () => {
    const label = newLabel.trim();
    if (!label) return;
    const taken = new Set((schema || []).map((x) => x.key));
    const baseKey = slugify(label);
    const uniqueKey = ensureUniqueKey(baseKey, taken);

    const def: LineUpFieldDef = {
      id: uid(),
      key: uniqueKey,
      label,
      type: newType,
      required: newRequired || false,
      options:
        newType === "select"
          ? newOptions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    };
    setSchema([...(schema || []), def]);
    setNewLabel("");
    setNewType("text");
    setNewRequired(false);
    setNewOptions("");
  };

  const removeField = (id: string) =>
    setSchema(schema.filter((f) => f.id !== id));

  const moveField = (id: string, dir: -1 | 1) => {
    const idx = schema.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= schema.length) return;
    const copy = schema.slice();
    const [f] = copy.splice(idx, 1);
    copy.splice(ni, 0, f);
    setSchema(copy);
  };

  const changeFieldKey = (id: string, nextRaw: string) => {
    const base = slugify(nextRaw);
    const taken = new Set(schema.filter((x) => x.id !== id).map((x) => x.key));
    const unique = ensureUniqueKey(base, taken);
    setSchema(schema.map((x) => (x.id === id ? { ...x, key: unique } : x)));
  };

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { schema: LineUpFieldDef[]; items: LineUpItem[]; title: string }
    >();
    for (const it of lineup) {
      const sig = schemaSignature(it.schema);
      if (!map.has(sig)) {
        map.set(sig, {
          schema: it.schema || [],
          items: [],
          title:
            (it.schema && it.schema.length
              ? it.schema.map((f) => f.label).join(" / ")
              : "Base fields only") || "Base fields only",
        });
      }
      map.get(sig)!.items.push(it);
    }
    return Array.from(map.values());
  }, [lineup]);

  const renderInput = (f: LineUpFieldDef) => {
    const val = lineupDraft.custom?.[f.key] ?? "";
    switch (f.type) {
      case "number":
        return (
          <input
            className={inputBase}
            type="number"
            inputMode="decimal"
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
            placeholder={f.label}
          />
        );
      case "date":
        return (
          <input
            className={inputBase}
            type="date"
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
          />
        );
      case "datetime":
        return (
          <input
            className={inputBase}
            type="datetime-local"
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            className={inputBase}
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
          >
            <option value="" />
            {(f.options || []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case "yesno":
        return (
          <select
            className={inputBase}
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
          >
            <option value="" />
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      default:
        return (
          <input
            className={inputBase}
            value={val}
            onChange={(e) => setCustom(f.key, e.target.value)}
            placeholder={f.label}
          />
        );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Line-Up</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfig((s) => !s)}
            className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            {showConfig ? "Close builder" : "Customize fields"}
          </button>
          <span className={chip}>{lineup.length} items</span>
        </div>
      </div>

      {showConfig && (
        <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className={labelBase}>Field label</label>
              <input
                className={inputBase}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Operation"
              />
            </div>
            <div>
              <label className={labelBase}>Type</label>
              <select
                className={inputBase}
                value={newType}
                onChange={(e) => setNewType(e.target.value as FieldType)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="datetime">Date & time</option>
                <option value="select">Select</option>
                <option value="yesno">Yes/No</option>
              </select>
            </div>
            {newType === "select" && (
              <div className="flex-1">
                <label className={labelBase}>Options (comma separated)</label>
                <input
                  className={inputBase}
                  value={newOptions}
                  onChange={(e) => setNewOptions(e.target.value)}
                  placeholder="Load, Discharge, Bunkers"
                />
              </div>
            )}
            <div className="flex items-center gap-2 pt-6">
              <input
                id="req"
                type="checkbox"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="req" className="text-sm">
                Required
              </label>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={addField}
                className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 active:scale-[.98]"
              >
                Add field
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left">
                <tr className="text-gray-500 dark:text-neutral-400">
                  <th className="py-2 pr-4">Label</th>
                  <th className="py-2 pr-4">Key</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2 pr-4">Options</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(schema || []).map((f, idx) => (
                  <tr
                    key={f.id}
                    className="border-t border-gray-100 dark:border-white/10"
                  >
                    <td className="py-2 pr-4">
                      <input
                        className={inputBase}
                        value={f.label}
                        onChange={(e) =>
                          setSchema(
                            schema.map((x) =>
                              x.id === f.id
                                ? { ...x, label: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        className={inputBase}
                        value={f.key}
                        onChange={(e) => changeFieldKey(f.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        className={inputBase}
                        value={f.type}
                        onChange={(e) =>
                          setSchema(
                            schema.map((x) =>
                              x.id === f.id
                                ? { ...x, type: e.target.value as FieldType }
                                : x
                            )
                          )
                        }
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="datetime">Date & time</option>
                        <option value="select">Select</option>
                        <option value="yesno">Yes/No</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!f.required}
                        onChange={(e) =>
                          setSchema(
                            schema.map((x) =>
                              x.id === f.id
                                ? { ...x, required: e.target.checked }
                                : x
                            )
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-4">
                      {f.type === "select" ? (
                        <input
                          className={inputBase}
                          value={(f.options || []).join(", ")}
                          onChange={(e) =>
                            setSchema(
                              schema.map((x) =>
                                x.id === f.id
                                  ? {
                                      ...x,
                                      options: e.target.value
                                        .split(",")
                                        .map((v) => v.trim())
                                        .filter(Boolean),
                                    }
                                  : x
                              )
                            )
                          }
                          placeholder="Comma separated"
                        />
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveField(f.id, -1)}
                          className="px-2 py-1 rounded-full border border-gray-200 dark:border-white/10"
                          disabled={idx === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(f.id, 1)}
                          className="px-2 py-1 rounded-full border border-gray-200 dark:border-white/10"
                          disabled={idx === (schema?.length || 0) - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(f.id)}
                          className="px-2 py-1 rounded-full border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(schema?.length || 0) === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-gray-500 dark:text-neutral-400"
                    >
                      No fields yet. Add your first custom field above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelBase}>Vessel</label>
          <input
            className={inputBase}
            value={lineupDraft.name || ""}
            onChange={(e) =>
              setLineupDraft((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g. MV EXAMPLE"
          />
        </div>
        <div>
          <label className={labelBase}>IMO</label>
          <input
            className={inputBase}
            value={lineupDraft.imo || ""}
            onChange={(e) =>
              setLineupDraft((p) => ({ ...p, imo: e.target.value }))
            }
            placeholder="e.g. 9321483"
          />
        </div>
        <div>
          <label className={labelBase}>Port</label>
          <input
            className={inputBase}
            value={lineupDraft.port || ""}
            onChange={(e) =>
              setLineupDraft((p) => ({ ...p, port: e.target.value }))
            }
            placeholder="e.g. Port of Constanța"
          />
        </div>
        <div>
          <label className={labelBase}>Date Window</label>
          <input
            className={inputBase}
            value={(lineupDraft as any).window || ""}
            onChange={(e) =>
              setLineupDraft((p) => ({ ...(p as any), window: e.target.value }))
            }
            placeholder="e.g. Sep 18–20"
          />
        </div>
        <div>
          <label className={labelBase}>Notes</label>
          <input
            className={inputBase}
            value={lineupDraft.notes || ""}
            onChange={(e) =>
              setLineupDraft((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Optional remarks"
          />
        </div>
      </div>

      {schema?.length ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {schema.map((f) => (
            <div key={f.id}>
              <label className={labelBase}>
                {f.label}{" "}
                {f.required ? <span className="text-red-500">*</span> : null}
              </label>
              {renderInput(f)}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <button
          type="button"
          onClick={addLineupItem}
          className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition"
        >
          Add Line-Up Item
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">
            No items yet.
          </div>
        ) : (
          groups.map((g, gi) => {
            const baseCols = [
              { key: "name", label: "Vessel" },
              { key: "imo", label: "IMO" },
              { key: "port", label: "Port" },
              { key: "window", label: "Date Window" },
              { key: "notes", label: "Notes" },
            ] as const;

            return (
              <div
                key={gi}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 p-3"
              >
                <div className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
                  Schema: {g.title}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400">
                        {baseCols.map((c) => (
                          <th
                            key={c.key}
                            className="py-2 pr-3 whitespace-nowrap"
                          >
                            {c.label}
                          </th>
                        ))}
                        {g.schema.map((f) => (
                          <th
                            key={f.key}
                            className="py-2 pr-3 whitespace-nowrap"
                          >
                            {f.label}
                          </th>
                        ))}
                        <th className="py-2 pr-3 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.items.map((it) => (
                        <tr
                          key={it.id}
                          className="border-t border-gray-100 dark:border-white/10 hover:bg-gray-50/60 dark:hover:bg-white/5"
                        >
                          <td className="py-2 pr-3">{it.name || "—"}</td>
                          <td className="py-2 pr-3">{it.imo || "—"}</td>
                          <td className="py-2 pr-3">{it.port || "—"}</td>
                          <td className="py-2 pr-3">
                            {(it as any).window || "—"}
                          </td>
                          <td className="py-2 pr-3">{it.notes || "—"}</td>
                          {g.schema.map((f) => {
                            const raw = (it.custom || {})[f.key];
                            const val = formatByType(f.type, raw);
                            return (
                              <td
                                key={`${it.id}-${f.key}`}
                                className="py-2 pr-3"
                              >
                                {val === "" ? (
                                  <span className="opacity-50">—</span>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2 pr-3">
                            <button
                              type="button"
                              onClick={() => removeLineupItem(it.id)}
                              className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {g.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={5 + g.schema.length + 1}
                            className="py-3 text-center opacity-60"
                          >
                            No items in this group.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
