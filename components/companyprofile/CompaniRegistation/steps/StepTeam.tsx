"use client";

import { Dispatch, SetStateAction } from "react";
import { DirectoryUser, TeamMember } from "../form/types";
import { chip, inputBase, labelBase } from "../ui/classes";

type Props = {
  team: TeamMember[];
  memberDraft: TeamMember;
  setMemberDraft: Dispatch<SetStateAction<TeamMember>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filteredUsers: DirectoryUser[];
  pickDirectoryUser: (u: DirectoryUser) => void;
  addMember: () => void;
  removeMember: (id: string) => void;

  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  editRole: string;
  setEditRole: Dispatch<SetStateAction<string>>;
  editProfileUrl: string;
  setEditProfileUrl: Dispatch<SetStateAction<string>>;
  editIsDeputy: boolean;
  setEditIsDeputy: Dispatch<SetStateAction<boolean>>;
  startEdit: (m: TeamMember) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
};

function initials(first?: string, last?: string) {
  const f = (first || "").trim()[0] || "";
  const l = (last || "").trim()[0] || "";
  return (f + l).toUpperCase();
}

export default function StepTeam({
  team,
  memberDraft,
  setMemberDraft,
  searchQuery,
  setSearchQuery,
  filteredUsers,
  pickDirectoryUser,
  addMember,
  removeMember,
  editingId,
  editRole,
  setEditRole,
  editProfileUrl,
  setEditProfileUrl,
  editIsDeputy,
  setEditIsDeputy,
  startEdit,
  saveEdit,
  cancelEdit,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Team</h3>
        <span className={chip}>{team.length} members</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label className={labelBase}>Search registered user</label>
          <input
            className={inputBase}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type name, role or username"
          />
          {filteredUsers.length > 0 && (
            <div className="mt-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/95 shadow max-h-60 overflow-auto">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => pickDirectoryUser(u)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={`${u.firstName} ${u.lastName}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-700 grid place-items-center text-[11px] font-semibold text-gray-600 dark:text-neutral-200">
                        {initials(u.firstName, u.lastName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                        {u.role} · @{u.username}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 text-[11px] text-gray-500 dark:text-neutral-400">
            If the person is not registered, fill in the fields below manually.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelBase}>First Name</label>
            <input
              className={inputBase}
              value={memberDraft.firstName}
              onChange={(e) =>
                setMemberDraft((p) => ({ ...p, firstName: e.target.value }))
              }
              placeholder="John"
            />
          </div>
          <div>
            <label className={labelBase}>Last Name</label>
            <input
              className={inputBase}
              value={memberDraft.lastName}
              onChange={(e) =>
                setMemberDraft((p) => ({ ...p, lastName: e.target.value }))
              }
              placeholder="Doe"
            />
          </div>
          <div>
            <label className={labelBase}>Role / Position</label>
            <input
              className={inputBase}
              value={memberDraft.role}
              onChange={(e) =>
                setMemberDraft((p) => ({ ...p, role: e.target.value }))
              }
              placeholder="Operations Manager"
            />
          </div>
          <div>
            <label className={labelBase}>Avalon Profile (URL)</label>
            <input
              className={inputBase}
              value={memberDraft.profileUrl || ""}
              onChange={(e) =>
                setMemberDraft((p) => ({ ...p, profileUrl: e.target.value }))
              }
              placeholder="https://avalon.app/u/username"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={!!memberDraft.isDeputy}
            onChange={(e) =>
              setMemberDraft((p) => ({ ...p, isDeputy: e.target.checked }))
            }
          />
          Grant management rights (deputy)
        </label>

        <div className="mt-1">
          <button
            type="button"
            onClick={addMember}
            className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition"
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {team.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">
            No team members yet. Add your colleagues to showcase your company
            team.
          </div>
        ) : (
          team.map((m) => {
            const isEditing = editingId === m.id;
            return (
              <div
                key={m.id}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={`${m.firstName} ${m.lastName}`}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-neutral-700 grid place-items-center text-xs font-semibold text-gray-600 dark:text-neutral-200 shrink-0">
                        {initials(m.firstName, m.lastName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {m.firstName} {m.lastName}
                        {m.isDeputy ? (
                          <span className="ml-2 align-middle text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-300/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/20">
                            deputy
                          </span>
                        ) : null}
                      </div>

                      {!isEditing ? (
                        <div className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                          {m.role}
                          {m.profileUrl ? (
                            <>
                              {" · "}
                              <a
                                href={m.profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                Profile
                              </a>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={labelBase}>Role</label>
                            <input
                              className={inputBase}
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Profile URL</label>
                            <input
                              className={inputBase}
                              value={editProfileUrl}
                              onChange={(e) =>
                                setEditProfileUrl(e.target.value)
                              }
                              placeholder="https://avalon.app/u/username"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-neutral-300 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={editIsDeputy}
                              onChange={(e) =>
                                setEditIsDeputy(e.target.checked)
                              }
                            />
                            Management rights (deputy)
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(m.id)}
                          className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
