import { api } from "@/lib/axios";
import type { VisitorsResponse } from "@/api/get-visitors";

interface PostVisitorBody {
  name: string;
  document: string;
  phone?: string;
  visitReason?: string;
  hostId: string;
  unlimitedAccess: boolean;
  allowedHours?: number;
}

export async function postVisitor({
  name,
  document,
  phone,
  visitReason,
  hostId,
  unlimitedAccess,
  allowedHours,
}: PostVisitorBody) {
  const response = await api.post<VisitorsResponse>("/visitors", {
    name,
    document,
    phone,
    visitReason,
    hostId,
    unlimitedAccess,
    allowedHours,
  });

  return response.data;
}
