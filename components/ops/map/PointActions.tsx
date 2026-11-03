"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MessageCircle, MessagesSquare, Phone, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { pointTitle, useFavoriteToggle, type TeamPoint } from "@/lib/points/team-points";

export function pointShareUrl(id: string): string {
  return `${window.location.origin}/maps?point=${encodeURIComponent(id)}`;
}

/** Phones get the system share sheet; desktops (and a cancelled/failed sheet) copy the link */
export async function sharePoint(point: TeamPoint): Promise<void> {
  const url = pointShareUrl(point.id);
  const title = pointTitle(point);
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (touch && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text: `${title} — Avalon fleet map`, url });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied", { description: url });
  } catch {
    toast.message("Copy this link", { description: url });
  }
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim().split("@").map(encodeURIComponent).join("@")}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappDigits(phone: string | null): string {
  return phone ? phone.replace(/[^\d]/g, "") : "";
}

const ACTION =
  "flex min-w-0 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
const BUBBLE = "flex h-10 w-10 items-center justify-center rounded-full border bg-card shadow-card";

function Action({ label, icon, href, external, onClick, active }: { label: string; icon: ReactNode; href?: string; external?: boolean; onClick?: () => void; active?: boolean }) {
  const body = (
    <>
      <span className={cn(BUBBLE, active && "border-amber-400/60 bg-amber-400/15 text-amber-500")}>{icon}</span>
      <span className="max-w-full truncate tracking-tight">{label}</span>
    </>
  );
  if (href && !external && href.startsWith("/")) {
    return (
      <Link href={href} className={ACTION}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={ACTION} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={ACTION} aria-pressed={active}>
      {body}
    </button>
  );
}

/** Chat · Share · Favorite · Call · WhatsApp · Email */
export function PointActions({ point }: { point: TeamPoint }) {
  const { user } = useAuth();
  const toggleFavorite = useFavoriteToggle();
  const author = point.createdBy;
  const isMine = !!author && !!user && String(author.id) === String(user.id);
  const wa = whatsappDigits(point.phone);

  return (
    <div className="grid auto-cols-fr grid-flow-col gap-0.5" role="group" aria-label="Point actions">
      {author && !isMine ? <Action label="Chat" href={`/chat?with=${author.id}`} icon={<MessagesSquare className="h-[18px] w-[18px] text-primary" />} /> : null}
      <Action label="Share" onClick={() => void sharePoint(point)} icon={<Share2 className="h-[18px] w-[18px]" />} />
      <Action
        label={point.isFavorite ? "Saved" : "Favorite"}
        active={point.isFavorite}
        onClick={() => void toggleFavorite(point)}
        icon={<Star className={cn("h-[18px] w-[18px]", point.isFavorite && "fill-current")} />}
      />
      {point.phone ? <Action label="Call" href={telHref(point.phone)} icon={<Phone className="h-[18px] w-[18px]" />} /> : null}
      {wa.length >= 9 ? <Action label="WhatsApp" href={`https://wa.me/${wa}`} external icon={<MessageCircle className="h-[18px] w-[18px] text-ok" />} /> : null}
      {point.email ? <Action label="Email" href={mailtoHref(point.email)} icon={<Mail className="h-[18px] w-[18px]" />} /> : null}
    </div>
  );
}
