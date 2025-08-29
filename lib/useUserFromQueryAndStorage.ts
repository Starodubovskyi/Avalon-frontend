"use client";

import { useEffect, useState } from "react";

export type AppUser = {
  name: string;
  email?: string;
  handle?: string;
  avatar?: string;
  photo?: string;
  followers?: string;
  follows?: string;
  posts?: string;
};

export function useUserFromQueryAndStorage(defaultUser: AppUser) {
  const [user, setUser] = useState<AppUser>(defaultUser);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("app.user");
      if (saved) {
        setUser((u) => ({ ...u, ...JSON.parse(saved) }));
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const patch: Partial<AppUser> = {};
    const keys = [
      "name",
      "email",
      "handle",
      "avatar",
      "photo",
      "followers",
      "follows",
      "posts",
    ] as const;
    keys.forEach((k) => {
      const v = params.get(k);
      if (v) (patch as any)[k] = v;
    });

    if (Object.keys(patch).length) {
      setUser((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem("app.user", JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, []);

  return user;
}
