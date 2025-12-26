import { api } from "@/lib/axios";

export type PackageStatus = "pending" | "retrieved" | "cancelled" | "delayed";
export type PackageType = "box" | "envelope" | "food" | "others";

export type Package = {
  id: string;
  description: string;
  carrier: string | null;
  type: PackageType;
  status: PackageStatus;
  imageUrl?: string | null;
  receivedAt: string;
  retrievedAt: string | null;
  deliveredAt: string | null;
  codeExpiresAt: string;
  codeHint: string | null;
  residentId: string;
  createdById: string;
  resident: {
    name: string;
    apartment: string | null;
    phone: string | null;
  };
  createdBy: {
    name: string;
  };
};

export async function getPackages() {
  const response = await api.get<Package[]>("/packages");
  return response.data;
}
