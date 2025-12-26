import { api } from "@/lib/axios";

export type PatchPackagePayload = {
  id: string;
  residentId?: string;
  description?: string;
  carrier?: string;
  type?: "box" | "envelope" | "food" | "others";
};

export async function patchPackage({ id, ...payload }: PatchPackagePayload) {
  const response = await api.patch(`/packages/${id}`, payload);

  return response.data;
}
