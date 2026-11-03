import { DEMO_STATE_VERSION, type DemoState } from "../types";
import { seedCompanyMembers } from "./companies";
import { seedDocuments } from "./documents";
import { seedHistory } from "./history";
import { seedChat, seedFeed, seedFollows } from "./network";
import { seedPoints, seedPorts } from "./places";
import { seedRequests } from "./requests";
import { seedUsers } from "./users";
import { seedVessels } from "./vessels";
import { seedWallet } from "./wallet";

/** Fresh demo database; every date is relative to `now` so the board always looks current */
export function seedDemoState(now: Date): DemoState {
  const t = now.getTime();
  const vessels = seedVessels(t);
  const vesselEvents = seedHistory(vessels, t);
  const { conversations, messages } = seedChat(t);
  const { posts, likes, comments } = seedFeed(t);
  const mapPoints = seedPoints(t);
  const { topUpRequests, walletTransactions, rankBoosts } = seedWallet(mapPoints, t);
  return {
    version: DEMO_STATE_VERSION,
    seededAt: now.toISOString(),
    users: seedUsers(t),
    vessels,
    vesselEvents,
    documents: seedDocuments(vessels, t),
    mapPoints,
    conversations,
    messages,
    posts,
    likes,
    comments,
    follows: seedFollows(),
    ports: seedPorts(t),
    agencyRequests: seedRequests(vessels, t),
    pendingReplies: [],
    companyMembers: seedCompanyMembers(mapPoints, t),
    walletTransactions,
    topUpRequests,
    rankBoosts,
  };
}
