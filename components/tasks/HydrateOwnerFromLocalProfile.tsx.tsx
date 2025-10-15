"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/components/tasks/store/tasks";

export default function HydrateOwnerFromLocalProfile() {
  const setMe = useProjectStore((s) => s.setCurrentUser);
  const store = useProjectStore;

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("currentUser");
        if (!raw) return;

        const u = JSON.parse(raw) as {
          name?: string;
          lastName?: string;
          profileImage?: string;
        };

        const fullName = [u?.name || "", u?.lastName || ""].join(" ").trim();
        if (!fullName) return;

        setMe({ name: fullName, avatarUrl: u.profileImage || undefined });

        const s = store.getState();
        const meId = s.currentUserId;
        const p = s.project;
        if (meId && p) {
          store.setState({
            project: {
              ...p,
              ownerId: p.ownerId || meId,
              memberIds: Array.from(new Set([...(p.memberIds || []), meId])),
            },
          });
        }
      } catch {}
    };

    load();

    const onStorage = (e: StorageEvent) => e.key === "currentUser" && load();
    window.addEventListener("storage", onStorage);

    const onLocal = () => load();
    window.addEventListener("currentUser:changed", onLocal as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "currentUser:changed",
        onLocal as EventListener
      );
    };
  }, [setMe]);

  return null;
}
