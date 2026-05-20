import { api } from "@/lib/axios";

export type PostStaffPayload = {
  name: string;
  email: string;
  phone?: string;
  shift?: string;
};

export async function postStaff(payload: PostStaffPayload) {
  const response = await api.post("/auth/users", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? undefined,
    shift: payload.shift ?? undefined,
    role: "doorman",
  });

  return response.data;
}
