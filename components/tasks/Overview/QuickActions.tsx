"use client";

import { useState } from "react";
import CreateTaskModal from "./modals/CreateTaskModal";
import InviteTeamModal from "./modals/InviteTeamModal";
import UploadFileModal from "./modals/UploadFileModal";

export default function QuickActions() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const card =
    "rounded-2xl border border-gray-200 bg-white p-4 text-left hover:shadow-sm transition dark:bg-white/[0.04] dark:border-white/10";
  const badge =
    "rounded-xl border border-gray-200 bg-gray-50 p-2 dark:bg-white/[0.04] dark:border-white/10";
  const title = "font-medium text-gray-900 dark:text-white";
  const subtitle = "text-sm text-gray-500 dark:text-gray-400";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <button onClick={() => setOpenCreate(true)} className={card}>
          <div className="flex items-center gap-3">
            <div className={badge} />
            <div>
              <div className={title}>Create Task</div>
              <div className={subtitle}>Organize task to your project</div>
            </div>
          </div>
        </button>

        <button onClick={() => setOpenInvite(true)} className={card}>
          <div className="flex items-center gap-3">
            <div className={badge} />
            <div>
              <div className={title}>Invite Team</div>
              <div className={subtitle}>Add people to your project</div>
            </div>
          </div>
        </button>

        <button onClick={() => setOpenUpload(true)} className={card}>
          <div className="flex items-center gap-3">
            <div className={badge} />
            <div>
              <div className={title}>Upload a File</div>
              <div className={subtitle}>Upload file to your projects</div>
            </div>
          </div>
        </button>
      </div>

      <CreateTaskModal open={openCreate} onClose={() => setOpenCreate(false)} />
      <InviteTeamModal open={openInvite} onClose={() => setOpenInvite(false)} />
      <UploadFileModal open={openUpload} onClose={() => setOpenUpload(false)} />
    </>
  );
}
