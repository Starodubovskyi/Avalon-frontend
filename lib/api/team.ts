"use client";

import api from "./client";

export interface TeamMember {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: { id: number; name?: string | null } | null;
  status: { id: number; name?: string | null } | null;
  createdAt: string;
}

export interface CreateMemberInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

interface Paginated<T> {
  data: T[];
  hasNextPage: boolean;
}

const ACTIVE_STATUS = 1;
const PAGE_SIZE = 50;
const MAX_PAGES = 40;

export const TeamApi = {
  /** All users; the boilerplate caps a page at 50, viewers self-register so the list grows */
  async list(): Promise<TeamMember[]> {
    const all: TeamMember[] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { data } = await api.get<Paginated<TeamMember>>("/users", {
        params: { page, limit: PAGE_SIZE },
      });
      all.push(...data.data);
      if (!data.hasNextPage) break;
    }
    return all;
  },

  async create(input: CreateMemberInput): Promise<TeamMember> {
    const { data } = await api.post<TeamMember>("/users", {
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      role: { id: input.roleId },
      status: { id: ACTIVE_STATUS },
    });
    return data;
  },

  async setRole(id: number, roleId: number): Promise<TeamMember> {
    const { data } = await api.patch<TeamMember>(`/users/${id}`, {
      role: { id: roleId },
    });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export const AccountApi = {
  async update(input: {
    firstName?: string;
    lastName?: string;
    password?: string;
    oldPassword?: string;
  }): Promise<void> {
    await api.patch("/auth/me", input);
  },
};
