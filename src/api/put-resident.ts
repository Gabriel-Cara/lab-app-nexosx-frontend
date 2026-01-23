import { api } from "@/lib/axios";

export type PutResidentPayload = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "staff" | "resident";
  apartment?: string;
  shift?: string;
  password?: string;
  building?: string;
  vehicles?: {
    model: string;
    plate: string;
    year: number;
  }[];
  emergencyContact?: string;
};

export async function putResident({
  id,
  ...payload
}: PutResidentPayload) {
  const response = await api.put(`/auth/users/${id}`, {
    ...payload,
    phone: payload.phone ?? undefined,
    apartment: payload.apartment ?? undefined,
    shift: payload.shift ?? undefined,
    building: payload.building ?? undefined,
    vehicles: payload.vehicles ?? undefined,
    emergencyContact: payload.emergencyContact ?? undefined,
  });

  return response.data;
}
