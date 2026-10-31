import { uuid } from "../ids";
import type { CommentRow, ConversationRow, FollowRow, LikeRow, MessageRow, PostRow } from "../types";

/** Chat threads, feed posts and follows between the invented team and two partner viewers */

const MIN = 60_000;

type Line = [senderId: number, minutesAgo: number, body: string];

interface Thread {
  kind: "direct" | "group";
  title: string | null;
  members: number[];
  /** minutes ago each member last read the thread (null = never) */
  readAgo: Record<number, number | null>;
  lines: Line[];
}

const THREADS: Thread[] = [
  {
    kind: "direct",
    title: null,
    members: [701, 702],
    readAgo: { 701: 95, 702: 1 },
    lines: [
      [701, 300, "Andrei, is the pilot for TOYA confirmed for tonight?"],
      [702, 290, "Yes — Marin boards at 21:00 at the roads, two tugs ordered for Galați."],
      [701, 285, "Great. And KEREMCAN — did owners approve the PDA?"],
      [702, 120, "Still waiting. They question the berth dues at Reni, I sent them the tariff sheet."],
      [702, 42, "Owners just replied: they want a call tomorrow at 10:00 before approving."],
      [702, 40, "I put a note on the vessel card so the team sees it."],
    ],
  },
  {
    kind: "group",
    title: "Sulina ops",
    members: [701, 702, 703, 704],
    readAgo: { 701: 70, 702: 30, 703: 30, 704: 200 },
    lines: [
      [703, 1500, "Harbour master notice: max draft in the Sulina channel 7.0 m from Monday."],
      [704, 1480, "Noted. KARANFIL is in ballast, no issue for us."],
      [701, 900, "Please re-check prearrivals for every loaded ship coming this week."],
      [702, 600, "ATA1 and KEREMCAN are below 6.9 m, both fine."],
      [703, 240, "PRINCESS ABIR discharge going well — 2,900 t done, surveyor happy."],
      [704, 55, "Crew change for TOYA at Galați confirmed, taxis booked for 04:30."],
    ],
  },
  {
    kind: "direct",
    title: null,
    members: [705, 701],
    readAgo: { 705: 15, 701: 400 },
    lines: [
      [705, 1440, "Good morning Irina, could you share the latest ETA for KARANFIL?"],
      [701, 1400, "Good morning Sofia — ETA Sulina tomorrow afternoon, I will confirm once she clears the Bosphorus."],
      [705, 25, "Thank you! Will the vet inspection at Brăila be on arrival day?"],
    ],
  },
  {
    kind: "direct",
    title: null,
    members: [706, 702],
    readAgo: { 706: 5, 702: 2000 },
    lines: [
      [706, 2900, "Hi Andrei, any news on the berth for SEA GLORY at Reni?"],
      [702, 2880, "Hi Daniel — Reni is congested this week, I expect a berth window around her ETA. Will keep you posted."],
    ],
  },
];

export function seedChat(now: number): { conversations: ConversationRow[]; messages: MessageRow[] } {
  const conversations: ConversationRow[] = [];
  const messages: MessageRow[] = [];
  for (const t of THREADS) {
    const id = uuid();
    const firstAt = now - (t.lines[0][1] + 5) * MIN;
    const lastAt = new Date(now - t.lines[t.lines.length - 1][1] * MIN).toISOString();
    const [a, b] = t.members;
    conversations.push({
      id,
      kind: t.kind,
      title: t.title,
      createdById: t.lines[0][0],
      directKey: t.kind === "direct" ? `${Math.min(a, b)}:${Math.max(a, b)}` : null,
      createdAt: new Date(firstAt).toISOString(),
      lastMessageAt: lastAt,
      members: t.members.map((userId, i) => {
        const ago = t.readAgo[userId];
        return {
          userId,
          joinedAt: new Date(firstAt + i).toISOString(),
          lastReadAt: ago === null || ago === undefined ? null : new Date(now - ago * MIN).toISOString(),
        };
      }),
    });
    for (const [senderId, ago, body] of t.lines) {
      messages.push({ id: uuid(), conversationId: id, senderId, body, createdAt: new Date(now - ago * MIN).toISOString() });
    }
  }
  return { conversations, messages };
}

interface PostSpec {
  author: number;
  minutesAgo: number;
  body: string;
  likes: number[];
  comments: [authorId: number, minutesAgo: number, body: string][];
}

const POSTS: PostSpec[] = [
  {
    author: 703,
    minutesAgo: 180,
    body: "PRINCESS ABIR is all fast at Izmail berth 7 — discharge of 4,200 t wheat runs until tomorrow evening. The full document pack (NOR, manifest, PDA) is in Documents.",
    likes: [701, 702, 705],
    comments: [
      [701, 170, "Great work, thank you Olena."],
      [705, 150, "Thanks for the quick turnaround — owners are very pleased."],
    ],
  },
  {
    author: 701,
    minutesAgo: 1380,
    body: "Reminder for everyone: from Monday the Sulina channel max draft is 7.0 m (Danube level is dropping). Please double-check prearrivals for every loaded ship and flag anything above 6.8 m.",
    likes: [702, 703, 704],
    comments: [[702, 1300, "KEREMCAN is at 6.8 m — fine, but I'll keep an eye on the gauge."]],
  },
  {
    author: 702,
    minutesAgo: 2900,
    body: "The pilot boarding position at Sulina roads has moved 1.5 nm east of the breakwater. All masters in the line-up have been informed by email.",
    likes: [701],
    comments: [],
  },
  {
    author: 704,
    minutesAgo: 4300,
    body: "Crew change for TOYA done at Galați — 6 on / 6 off, travel documents checked with the border police in advance. Smooth one.",
    likes: [703, 701],
    comments: [[703, 4200, "Nice, that saves us a day next time."]],
  },
  {
    author: 706,
    minutesAgo: 5800,
    body: "Thank you to the Avalon team for a smooth call of SEA PIONEER at Reni — on time, no surprises in the final DA.",
    likes: [701, 702],
    comments: [[701, 5700, "Our pleasure, Daniel — see you on the next one."]],
  },
];

export function seedFeed(now: number): { posts: PostRow[]; likes: LikeRow[]; comments: CommentRow[] } {
  const posts: PostRow[] = [];
  const likes: LikeRow[] = [];
  const comments: CommentRow[] = [];
  for (const p of POSTS) {
    const id = uuid();
    posts.push({ id, authorId: p.author, body: p.body, createdAt: new Date(now - p.minutesAgo * MIN).toISOString(), deletedAt: null });
    for (const userId of p.likes) likes.push({ postId: id, userId });
    for (const [authorId, ago, body] of p.comments) {
      comments.push({ id: uuid(), postId: id, authorId, body, createdAt: new Date(now - ago * MIN).toISOString(), deletedAt: null });
    }
  }
  return { posts, likes, comments };
}

export function seedFollows(): FollowRow[] {
  const pairs: [number, number][] = [
    [701, 702], [701, 703],
    [702, 701], [702, 703], [702, 704],
    [703, 701],
    [704, 701], [704, 702],
    [705, 701], [705, 703],
    [706, 701],
  ];
  return pairs.map(([followerId, followeeId]) => ({ followerId, followeeId }));
}
