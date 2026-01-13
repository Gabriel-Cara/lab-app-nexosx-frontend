import { api } from "@/lib/axios";

export type ResidentSignupPayload = {
  token: string;
  name: string;
  email: string;
  phone?: string;
  apartment: string;
  building?: string;
  vehicle?: string;
  emergencyContact?: string;
  password?: string;
};

export async function postResidentSignup(payload: ResidentSignupPayload) {
  const response = await api.post("/auth/resident-signup", {
    token: payload.token,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? undefined,
    apartment: payload.apartment,
    building: payload.building ?? undefined,
    vehicle: payload.vehicle ?? undefined,
    emergencyContact: payload.emergencyContact ?? undefined,
    password: payload.password ?? undefined,
  });

  return response.data;
}
