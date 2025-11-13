import { api } from "@/lib/axios";

export type VisitorsResponse = {
  status: "pending" | "authorized" | "denied" | "entry" | "left";
  createdAt: string;
  entryTime: string
  exitTime: string
  handledBy: {
    name: string;
  } | null;
  handledById: string | null;
  host: {
    name: string;
    apartment: string | null;
  };
  hostId: string;
    name: string
    apartment: string
  }
  hostId: string
  visitor: {
    createdAt: string;
    document: string;
    id: string;
    name: string;
    phone?: string;
    status: "pending" | "authorized" | "denied" | "entry" | "left";
    updatedAt: string;
    visitReason?: string;
  };
  visitorId: string;
};

export async function getVisitors() {
  const response = await api.get<VisitorsResponse[]>("/visitors");

  return response.data;
}
