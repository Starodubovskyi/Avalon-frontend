export interface MapPoint {
  id: string;
  userId: string | number;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  activity: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  photoId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMapPointDto {
  lat: number;
  lng: number;
  firstName: string;
  lastName?: string;
  activity?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoId?: string;
}

export type UpdateMapPointDto = Partial<
  Omit<MapPoint, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface AuthUser {
  id: number | string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: { id: number; name: string | null } | null;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: AuthUser | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
