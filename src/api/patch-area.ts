import { api } from "@/lib/axios";

interface PatchAreaRequest {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  available: boolean;
}

export async function patchArea({
  id,
  name,
  description,
  capacity,
  available,
}: PatchAreaRequest) {
  const response = await api.patch(`/areas/${id}`, {
    name,
    description,
    capacity,
    available,
  });

  return response.data;
}
