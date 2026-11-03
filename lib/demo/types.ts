import type {
  Destination,
  DocumentCategory,
  OkStatus,
  T1Status,
  VesselCondition,
  VesselType,
} from "@/lib/vessels/types";
import type { PointKind } from "@/lib/points/team-points";
import type { ActivityCode } from "@/lib/points/activities";
import type { AgencyRequest } from "@/lib/requests/types";
import type { PointVisibility } from "@/lib/points/team-points";
import type { TopUpStatus, WalletTransactionKind } from "@/lib/wallet/types";
import type { AppLocale } from "@/i18n/config";

/** Rows of the in-browser demo database; dates are ISO strings, soft deletes keep the row */

export type RoleIdValue = 1 | 2 | 3;

export interface DemoUserRow {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: RoleIdValue;
  statusId: number;
  /** Public profile (stage 2): short position line, about text, phone (only self and the team see it) */
  headline: string | null;
  bio: string | null;
  phone: string | null;
  locale: AppLocale;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VesselRow {
  id: string;
  name: string;
  imo: string | null;
  mmsi: string | null;
  type: VesselType;
  destination: Destination;
  condition: VesselCondition | null;
  etaSulina: string | null;
  arrivedAt: string | null;
  inPortAt: string | null;
  departedAt: string | null;
  lat: number | null;
  lng: number | null;
  sog: number | null;
  cog: number | null;
  positionSource: "ais" | "manual" | null;
  positionAt: string | null;
  masterName: string | null;
  masterPhone: string | null;
  masterEmail: string | null;
  officeName: string | null;
  officePhone: string | null;
  officeEmail: string | null;
  portAgent: string | null;
  prearrivalsIn: OkStatus;
  prearrivalsOut: OkStatus;
  mswIn: boolean;
  mswOut: boolean;
  pdaSent: boolean;
  paid: boolean;
  t1: T1Status | null;
  pilotageArranged: boolean;
  pilot: string | null;
  notes: string | null;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** Where simulated AIS drift started; drift is pulled back here when it wanders off */
  anchor: [number, number] | null;
}

export type FieldValue = string | number | boolean | null;
export type FieldChanges = Record<string, { from: FieldValue; to: FieldValue }>;

export interface VesselEventRow {
  id: string;
  vesselId: string;
  vesselName: string;
  userId: number | null;
  action: "created" | "updated" | "deleted";
  changes: FieldChanges;
  createdAt: string;
}

export interface DocumentRow {
  id: string;
  title: string;
  category: DocumentCategory;
  vesselId: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  notes: string | null;
  uploadedById: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface MapPointRow {
  id: string;
  userId: number;
  kind: PointKind;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  activity: string;
  /** Business Activity codes (0 or 1 without Premium) */
  activities: ActivityCode[];
  /** data:image/… URL, served by GET /map-points/:id/logo */
  logo: string | null;
  /** Changes with every new logo (cache key of the logo URL); null without a logo */
  logoVersion: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  /** map_point_favorite rows of this point (user ids) */
  favoritedBy: number[];
  /** public: everyone; team: the Avalon team and the owner */
  visibility: PointVisibility;
  description: string | null;
  website: string | null;
  /** Head office of a branch */
  parentId: string | null;
  /** Paid Business Activity slots, 1–14 */
  activitySlots: number;
  emailVerifiedAt: string | null;
  emailVerificationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** company_member: someone who said "I work here"; the owner (point author) has no row */
export interface CompanyMemberRow {
  pointId: string;
  userId: number;
  position: string | null;
  status: "pending" | "active";
  createdAt: string;
}

/** wallet_transaction: insert-only ledger, the balance is the sum */
export interface WalletTransactionRow {
  id: string;
  userId: number;
  amount: number;
  kind: WalletTransactionKind;
  note: string | null;
  pointId: string | null;
  createdById: number | null;
  createdAt: string;
}

export interface TopUpRequestRow {
  id: string;
  userId: number;
  amount: number;
  note: string | null;
  status: TopUpStatus;
  handledById: number | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RankBoostRow {
  id: string;
  userId: number;
  points: number;
  expiresAt: string;
  createdAt: string;
}

export interface ConversationMemberRow {
  userId: number;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface ConversationRow {
  id: string;
  kind: "direct" | "group";
  title: string | null;
  createdById: number;
  directKey: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  members: ConversationMemberRow[];
}

export interface MessageRow {
  id: string;
  conversationId: string;
  senderId: number;
  body: string;
  createdAt: string;
}

export interface PostRow {
  id: string;
  authorId: number;
  body: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface LikeRow {
  postId: string;
  userId: number;
}

export interface CommentRow {
  id: string;
  postId: string;
  authorId: number;
  body: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface FollowRow {
  followerId: number;
  followeeId: number;
}

export type PortStatusValue = "OPEN" | "CONGESTED" | "CLOSED";

export interface PortRow {
  id: string;
  name: string;
  unlocode: string;
  country: string | null;
  status: PortStatusValue;
  timezone: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Stored request: the API shape with the author id instead of the presented UserRef */
export type AgencyRequestRow = Omit<AgencyRequest, "createdBy"> & { createdById: number | null };

/** Simulated colleague answer, materialised by the first request after dueAt */
export interface PendingReply {
  conversationId: string;
  senderId: number;
  body: string;
  dueAt: string;
}

/** Bumped whenever the stored shape changes: an older saved demo is dropped and re-seeded */
export const DEMO_STATE_VERSION = 2;

export interface DemoState {
  version: typeof DEMO_STATE_VERSION;
  seededAt: string;
  users: DemoUserRow[];
  vessels: VesselRow[];
  vesselEvents: VesselEventRow[];
  documents: DocumentRow[];
  mapPoints: MapPointRow[];
  conversations: ConversationRow[];
  messages: MessageRow[];
  posts: PostRow[];
  likes: LikeRow[];
  comments: CommentRow[];
  follows: FollowRow[];
  ports: PortRow[];
  agencyRequests: AgencyRequestRow[];
  pendingReplies: PendingReply[];
  companyMembers: CompanyMemberRow[];
  walletTransactions: WalletTransactionRow[];
  topUpRequests: TopUpRequestRow[];
  rankBoosts: RankBoostRow[];
}
