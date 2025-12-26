import { api } from "@/lib/axios";
import type { Package, PackageType } from "@/api/get-packages";

interface PostPackageBody {
  residentId: string;
  description: string;
  carrier: string;
  type: PackageType;
}

export async function postPackage({ residentId, description, carrier, type }: PostPackageBody)  {
  const response = await api.post<Package>("/packages", {
    residentId,
    description,
    carrier,
    type,
  });

  return response.data;
}
