import { api } from "@/lib/axios";
import type { Package, PackageType } from "@/api/get-packages";
import type { NotificationResult } from "@/api/notification-types";

interface PostPackageBody {
  residentId: string;
  description: string;
  carrier: string;
  type: PackageType;
}

type PostPackageResponse = Package & {
  notification?: NotificationResult;
};

export async function postPackage({
  residentId,
  description,
  carrier,
  type,
}: PostPackageBody) {
  const response = await api.post<PostPackageResponse>("/packages", {
    residentId,
    description,
    carrier,
    type,
  });

  return response.data;
}
