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
  vehicles?: ResidentVehicle[];
  emergencyContact?: string | null;
};

export type ResidentVehicle = {
  id: string;
  model: string;
  plate: string;
  parkingSpot?: string | null;
  year: number;
};

export async function getProfile(id: string) {
  const response = await api.get<
    UserProfile & {
      residents?: {
        building: string | null;
        vehicles: ResidentVehicle[];
        emergencyContact: string | null;
      } | null;
    }
  >(`/auth/me/${id}`);

  const { residents, ...profile } = response.data;

  return {
    ...profile,
    building: residents?.building ?? null,
    vehicles: residents?.vehicles ?? [],
    emergencyContact: residents?.emergencyContact ?? null,
  };
}
