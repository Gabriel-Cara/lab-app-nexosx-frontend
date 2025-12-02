import { api } from "@/lib/axios";

export type PackageStatus = "pending" | "retrieved" | "cancelled";
export type PackageType = "box" | "envelope" | "food" | "others";

export type Package = {
  id: string;
  code: string;
  description: string;
  carrier: string | null;
  type: PackageType;
  status: PackageStatus;
  receivedAt: string;
  retrievedAt: string | null;
  deliveredAt: string | null;
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
