import { api } from "@/lib/axios";

interface PostPackageBody {
  residentId: string;
  description: string;
  carrier: string;
  type: string;
}

export async function postPackage({ residentId, description, carrier, type }: PostPackageBody)  {
  const response = await api.post("/packages", {
    residentId,
    description,
    carrier,
    type,
  });

  return response.data;
}