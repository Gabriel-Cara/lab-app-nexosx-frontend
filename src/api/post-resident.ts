import { api } from "@/lib/axios";

export type PostResidentPayload = {
  name: string;
  email: string;
  phone?: string;
  role: "manager" | "doorman" | "resident";
  apartment?: string;
  password?: string;
  building?: string;
  vehicles?: {
    model: string;
    plate: string;
    parkingSpot: string;
    year: number;
  }[];
  emergencyContact?: string;
};

export async function postResident(payload: PostResidentPayload) {
  const response = await api.post("/auth/users", {
    ...payload,
    phone: payload.phone ?? null,
    apartment: payload.apartment ?? null,
    building: payload.building ?? null,
    vehicles: payload.vehicles ?? [],
    emergencyContact: payload.emergencyContact ?? null,
  });

  return response.data;
}
