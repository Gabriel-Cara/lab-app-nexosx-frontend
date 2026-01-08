import { api } from "@/lib/axios";
import type { UserRole } from "@/types/auth";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  condominiumId?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  document?: string | null;
  apartment?: string | null;
  building?: string | null;
  vehicle?: string | null;
  emergencyContact?: string | null;
};

export async function getProfile(id: string) {
  const response = await api.get<UserProfile>(`/auth/me/${id}`);
  return response.data;
}
