"use client";

import { useMemo, useState } from "react";
import { TeamMember, DirectoryUser } from "../CompaniRegistation/form/types";
import StepTeam from "../CompaniRegistation/steps/StepTeam";
import { MOCK_USERS } from "../CompaniRegistation/data/mockUsers";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTeam: TeamMember[];
  onSave: (team: TeamMember[]) => void;
};

export default function ManageTeamModal({
  open,
  onClose,
  initialTeam,
  onSave,
}: Props) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam || []);
  const [memberDraft, setMemberDraft] = useState<TeamMember>({
    id: "",
    firstName: "",
    lastName: "",
    role: "",
    profileUrl: "",
    avatarUrl: "",
    isDeputy: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_USERS.filter((u) => {
      const hay =
        `${u.firstName} ${u.lastName} ${u.role} ${u.username}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 6);
  }, [searchQuery]);

  const pickDirectoryUser = (u: DirectoryUser) => {
    setMemberDraft({
      id: "",
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      profileUrl: u.profileUrl,
      avatarUrl: u.avatarUrl || "",
      isDeputy: false,
    });
    setSearchQuery(`${u.firstName} ${u.lastName}`);
  };

  const addMember = () => {
    if (!memberDraft.firstName || !memberDraft.lastName || !memberDraft.role)
      return;
    const newMember: TeamMember = {
      ...memberDraft,
      id: crypto.randomUUID(),
      profileUrl: memberDraft.profileUrl?.trim() || undefined,
      avatarUrl: memberDraft.avatarUrl?.trim() || undefined,
      isDeputy: !!memberDraft.isDeputy,
    };
    setTeam((p) => [...p, newMember]);
    setMemberDraft({
      id: "",
      firstName: "",
      lastName: "",
      role: "",
      profileUrl: "",
      avatarUrl: "",
      isDeputy: false,
    });
    setSearchQuery("");
  };

  const removeMember = (id: string) => {
    setTeam((p) => p.filter((m) => m.id !== id));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editProfileUrl, setEditProfileUrl] = useState("");
  const [editIsDeputy, setEditIsDeputy] = useState(false);

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditRole(m.role);
    setEditProfileUrl(m.profileUrl ?? "");
    setEditIsDeputy(!!m.isDeputy);
  };
  const saveEdit = () => {
    if (!editingId) return;
    setTeam((p) =>
      p.map((m) =>
        m.id === editingId
          ? {
              ...m,
              role: editRole,
              profileUrl: editProfileUrl || undefined,
              isDeputy: editIsDeputy,
            }
          : m
      )
    );
    setEditingId(null);
    setEditRole("");
    setEditProfileUrl("");
    setEditIsDeputy(false);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditRole("");
    setEditProfileUrl("");
    setEditIsDeputy(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[900px]">
        <div className="mx-auto rounded-t-2xl md:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
            <div className="font-semibold">Manage Team</div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700"
            >
              Close
            </button>
          </div>

          <div className="p-4 sm:p-6 max-h-[70vh] overflow-auto">
            <StepTeam
              team={team}
              memberDraft={memberDraft}
              setMemberDraft={setMemberDraft}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredUsers={filteredUsers}
              pickDirectoryUser={pickDirectoryUser}
              addMember={addMember}
              removeMember={removeMember}
              editingId={editingId}
              setEditingId={setEditingId}
              editRole={editRole}
              setEditRole={setEditRole}
              editProfileUrl={editProfileUrl}
              setEditProfileUrl={setEditProfileUrl}
              editIsDeputy={editIsDeputy}
              setEditIsDeputy={setEditIsDeputy}
              startEdit={startEdit}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
            />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(team);
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
