import { api } from "@/lib/axios";

export type StaffSignupPayload = {
  token: string;
  name: string;
  email: string;
  phone?: string;
  shift?: string;
  password?: string;
};

export async function postStaffSignup(payload: StaffSignupPayload) {
  const response = await api.post("/auth/staff-signup", {
    token: payload.token,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? undefined,
    shift: payload.shift ?? undefined,
    password: payload.password ?? undefined,
  });

  return response.data;
}
