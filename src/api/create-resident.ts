import { api } from "@/lib/axios";

export type CreateResidentPayload = {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "resident";
  apartment?: string;
  password: string;
  building?: string;
  vehicle?: string;
  emergencyContact?: string;
};

export async function createResident(payload: CreateResidentPayload) {
  const response = await api.post("/auth/users", {
    ...payload,
    phone: payload.phone ?? null,
    apartment: payload.apartment ?? null,
    building: payload.building ?? null,
    vehicle: payload.vehicle ?? null,
    emergencyContact: payload.emergencyContact ?? null,
  });

  return response.data;
}
