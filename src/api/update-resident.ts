import { api } from "@/lib/axios";

export type UpdateResidentPayload = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "staff" | "resident";
  apartment?: string;
  password?: string;
  building?: string;
  vehicle?: string;
  emergencyContact?: string;
};

export async function updateResident({
  id,
  ...payload
}: UpdateResidentPayload) {
  const response = await api.put(`/auth/users/${id}`, {
    ...payload,
    phone: payload.phone ?? undefined,
    apartment: payload.apartment ?? undefined,
    building: payload.building ?? undefined,
    vehicle: payload.vehicle ?? undefined,
    emergencyContact: payload.emergencyContact ?? undefined,
  });

  return response.data;
}
