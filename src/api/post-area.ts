import { api } from "@/lib/axios";

interface PostAreaData {
  name: string;
  description: string;
  capacity: number;
  available: boolean;
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
}: PostAreaData) {
  const response = await api.post<PostAreaResponse>("/areas", {
    name,
    description,
    capacity,
    available,
  });

  return response.data;
}
