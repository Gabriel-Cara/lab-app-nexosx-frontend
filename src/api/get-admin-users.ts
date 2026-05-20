import { api } from "@/lib/axios";
import type { UserRole } from "@/types/auth";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, "admin">;
  condominium?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export async function getAdminUsers() {
  const response = await api.get<AdminUser[]>("/admin/users");
  return response.data;
}
