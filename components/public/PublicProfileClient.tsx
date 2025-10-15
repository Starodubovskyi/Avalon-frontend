"use client";

import PublicProfile, { PublicUser } from "./PublicProfile";

export default function PublicProfileClient({ user }: { user: PublicUser }) {
  const onShare = () => {
    try {
      navigator.clipboard.writeText(location.href);
    } catch {}
  };
  const onMessage = () => alert(`Open chat with ${user.firstName}…`);
  const onAddFriend = async () => {
    await new Promise((r) => setTimeout(r, 500));
    alert("Friend request sent");
  };

  return (
    <PublicProfile
      user={user}
      onShare={onShare}
      onMessage={onMessage}
      onAddFriend={() => onAddFriend()}
    />
  );
}
