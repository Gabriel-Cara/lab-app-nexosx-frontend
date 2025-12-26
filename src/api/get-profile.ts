import { api } from "@/lib/axios";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "resident";
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
