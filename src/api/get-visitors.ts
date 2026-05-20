import { api } from "@/lib/axios";

export type VisitorStatus =
  | "pending"
  | "authorized"
  | "denied"
  | "entry"
  | "left";

export type VisitorsResponse = {
  id: string;
  status: VisitorStatus;
  createdAt: string;
  imageUrl?: string | null;
  entryTime: string | null;
  exitTime: string | null;
  expectedExitTime: string | null;
  unlimitedAccess: boolean;
  allowedHours: number | null;
  handledBy: {
    name: string;
  } | null;
  handledById: string | null;
  host: {
    name: string;
    apartment: string | null;
  };
  hostId: string;
  visitor: {
    createdAt: string;
    document: string;
    id: string;
    name: string;
    phone?: string;
    status: VisitorStatus;
    unlimitedAccess: boolean;
    allowedHours: number | null;
    updatedAt: string;
    visitReason?: string;
  };
  visitorId: string;
};

export async function getVisitors() {
  const response = await api.get<VisitorsResponse[]>("/visitors");

  return response.data;
}
