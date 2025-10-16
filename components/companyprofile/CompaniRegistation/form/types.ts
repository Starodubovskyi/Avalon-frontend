"use client";

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DirectoryUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  username: string;
  profileUrl: string;
  avatarUrl?: string;
};

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "yesno";

export type LineUpFieldDef = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  hiddenInList?: boolean;
};

export type CargoInfo = {
  type?: string;
  qty?: number;
  unit?: string;
};

export type LineUpItem = {
  id: string;
  name: string;
  imo?: string;
  port?: string;
  terminal?: string;
  berth?: string;
  cargo?: CargoInfo;
  eta?: string;
  etb?: string;
  etd?: string;
  status?: string;
  window?: string;
  notes?: string;
  custom?: Record<string, any>;
  schema?: LineUpFieldDef[];
};

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileUrl?: string;
  avatarUrl?: string;
  isDeputy?: boolean;
};
