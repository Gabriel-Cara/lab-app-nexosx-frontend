import { api } from "@/lib/axios";
import type { UserRole } from "@/types/auth";

export type ResidenceResident = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  role: UserRole;
};

export type Residence = {
  id: string;
  number: string;
  blockId: string;
  condominiumId: string;
  createdAt: string;
  updatedAt: string;
  block: {
    id: string;
    name: string;
  };
  residents: ResidenceResident[];
};

export type GetResidencesParams = {
  condominiumId?: string;
  blockId?: string;
  search?: string;
};

export async function getResidences(params?: GetResidencesParams) {
  const response = await api.get<Residence[]>("/residences", { params });
  return response.data;
}
