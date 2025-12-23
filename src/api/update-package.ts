import { api } from "@/lib/axios";

export type UpdatePackagePayload = {
  id: string;
  residentId?: string;
  description?: string;
  carrier?: string;
  type?: "box" | "envelope" | "food" | "others";
};

export async function updatePackage({ id, ...payload }: UpdatePackagePayload) {
  const response = await api.patch(`/packages/${id}`, payload);

  return response.data;
}
