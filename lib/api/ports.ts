"use client";

import api, { ensureAccessToken } from "./client";

export type PortStatus = "Open" | "Congested" | "Closed";

export interface Port {
  id: string;
  name: string;
  unlocode: string;
  country?: string;
  status: PortStatus | string;
  timezone?: string;
  [key: string]: any;
}

export interface CreatePortDto {
  name?: string;
  unlocode: string;
  country?: string;
  status: PortStatus;
  timezone?: string;
  portname?: string;
  portName?: string;
  title?: string;
  port?: string;
}

export interface UpdatePortDto extends Partial<CreatePortDto> {}

function toUpper5(code?: string) {
  const v = (code || "").toUpperCase().replace(/[^A-Z]/g, "");
  return v.slice(0, 5);
}

function mapStatusForServer(s?: string) {
  if (!s) return undefined;
  const x = s.toLowerCase();
  if (x === "open") return "OPEN";
  if (x === "congested") return "CONGESTED";
  if (x === "closed") return "CLOSED";
  return s;
}

function pickNameLike(input: any): string | null {
  const candidates = [
    input?.name,
    input?.portname,
    input?.portName,
    input?.title,
    input?.port,
  ];
  for (const c of candidates)
    if (typeof c === "string" && c.trim()) return c.trim();
  return null;
}

function normalizeCreate(dto: CreatePortDto) {
  const unlocode = toUpper5(dto.unlocode);
  const name = pickNameLike(dto) || unlocode || "PORT";
  const country = dto.country?.trim() || undefined;
  const timezone = dto.timezone?.trim() || "UTC";
  const status = mapStatusForServer(dto.status);

  return {
    name,
    unlocode,
    country,
    timezone,
    status,

    portname: name,
    port: name,
    code: unlocode,
    countryCode: country,
    state: status,
  };
}

function normalizeUpdate(dto: UpdatePortDto) {
  const patch: any = {};
  const name = pickNameLike(dto);
  if (name) {
    patch.name = name;
    patch.portname = name;
    patch.port = name;
  }
  if (dto.unlocode) {
    const u = toUpper5(dto.unlocode);
    patch.unlocode = u;
    patch.code = u;
  }
  if (dto.country) {
    const c = dto.country.trim();
    patch.country = c;
    patch.countryCode = c;
  }
  if (dto.timezone) patch.timezone = dto.timezone.trim();
  if (dto.status) {
    const s = mapStatusForServer(dto.status);
    patch.status = s;
    patch.state = s;
  }
  return patch;
}

export const PortsApi = {
  async list(params?: {
    search?: string;
    status?: PortStatus;
    page?: number;
    limit?: number;
  }): Promise<Port[]> {
    const { data } = await api.get("/ports", { params });
    const arr = extractArray(data);
    return arr.map(normalizeFromServer);
  },

  async create(payload: CreatePortDto): Promise<Port> {
    await ensureAccessToken();
    const u = toUpper5(payload.unlocode);
    if (u.length !== 5) throw new Error("UN/LOCODE must be 5 letters (A–Z)");
    const body = normalizeCreate({ ...payload, unlocode: u });
    const { data } = await api.post("/ports", body, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  async update(id: string, payload: UpdatePortDto): Promise<Port> {
    await ensureAccessToken();
    const body = normalizeUpdate(payload);
    const { data } = await api.patch(`/ports/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await ensureAccessToken();
    await api.delete(`/ports/${id}`);
  },
};
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  const cands = [
    data?.items,
    data?.data,
    data?.rows,
    data?.result,
    data?.results,
    data?.content,
    data?.payload,
    data?.value,
  ];
  for (const a of cands) {
    if (Array.isArray(a)) return a;
    if (a && Array.isArray(a.items)) return a.items;
  }
  return [];
}

function mapStatusFromServer(s?: string) {
  if (!s) return "Open";
  const x = String(s).toLowerCase();
  if (x.includes("open")) return "Open";
  if (x.includes("congest")) return "Congested";
  if (x.includes("close")) return "Closed";
  return s as any;
}

function normalizeFromServer(p: any) {
  const _id =
    p.id ??
    p._id ??
    p.uuid ??
    p.portId ??
    p.code ??
    p.unlocode ??
    p.portname ??
    p.port ??
    p.name ??
    null;

  const unloc =
    p.unlocode ?? p.code ?? p.locode ?? p.un_code ?? p.UNLOCODE ?? "";

  const name = p.portname ?? p.port ?? p.name ?? p.title ?? "";

  const country = p.flag ?? p.country ?? p.countryCode ?? p.cn ?? "";

  const status = mapStatusFromServer(p.status ?? p.state);

  return {
    ...p,
    id: String(_id ?? unloc ?? name),
    portname: name,
    unlocode: toUpper5(unloc),
    flag: country,
    status,
  };
}
