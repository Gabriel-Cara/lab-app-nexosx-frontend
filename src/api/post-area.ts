import { api } from "@/lib/axios";

interface PostAreaData {
  name: string;
  description?: string;
  capacity?: number;
  available: boolean;
  schedule?: {
    start: string;
    end: string;
    stepMinutes?: number;
  };
}

interface PostAreaResponse {
  id: string;
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

export async function postArea({
  name,
  description,
  capacity,
  available,
  schedule,
}: PostAreaData) {
  const response = await api.post<PostAreaResponse>("/areas", {
    name,
    description,
    capacity,
    available,
    schedule,
  });

  return response.data;
}
