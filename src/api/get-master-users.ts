import { api } from "@/lib/axios";
import type { UserRole } from "@/types/auth";

export type MasterUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, "master">;
  condominium?: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export async function getMasterUsers() {
  const response = await api.get<MasterUser[]>("/master/users");
  return response.data;
}
