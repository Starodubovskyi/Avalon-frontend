import type {
  Destination,
  DocumentCategory,
  OkStatus,
  T1Status,
  VesselCondition,
  VesselType,
} from "@/lib/vessels/types";
import type { PointKind } from "@/lib/points/team-points";
import type { AgencyRequest } from "@/lib/requests/types";

/** Rows of the in-browser demo database; dates are ISO strings, soft deletes keep the row */

export type RoleIdValue = 1 | 2 | 3;

export interface DemoUserRow {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: RoleIdValue;
  statusId: number;
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
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

export interface DemoState {
  version: 1;
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
}
