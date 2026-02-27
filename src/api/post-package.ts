import { api } from "@/lib/axios";
import type { Package, PackageType } from "@/api/get-packages";

interface PostPackageBody {
  residentId: string;
  description: string;
  carrier: string;
  type: PackageType;
}

type NotificationStatus = "sent" | "skipped" | "failed";
type NotificationFailureReason =
  | "missing_phone"
  | "no_external_provider"
  | "twilio_not_configured"
  | "twilio_from_missing"
  | "twilio_error";

type NotificationResult = {
  status: NotificationStatus;
  reason?: NotificationFailureReason;
  message?: string;
};

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
