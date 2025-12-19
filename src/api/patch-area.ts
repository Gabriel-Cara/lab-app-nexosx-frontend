import { api } from "@/lib/axios";

interface PatchAreaRequest {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  available: boolean;
  schedule?: {
    start: string;
    end: string;
    stepMinutes?: number;
  };
}

export async function patchArea({
  id,
  name,
  description,
  capacity,
  available,
  schedule,
}: PatchAreaRequest) {
  const response = await api.patch(`/areas/${id}`, {
    name,
    description,
    capacity,
    available,
    schedule,
  });

  return response.data;
}
