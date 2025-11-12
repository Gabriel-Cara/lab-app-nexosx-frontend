import { api } from "@/lib/axios";

interface PostVisitorBody {
  name: string;
  document: string;
  phone?: string;
  visitReason?: string;
  hostId: string;
}

export async function postVisitor({ name, document, phone, visitReason, hostId }: PostVisitorBody)  {
  const response = await api.post("/visitors", {
    name,
    document,
    phone,
    visitReason,
    hostId,
  });

  return response.data;
}