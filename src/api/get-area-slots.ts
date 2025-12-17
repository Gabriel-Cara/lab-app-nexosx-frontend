import { api } from "@/lib/axios";

export interface AreaSlot {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number | null;
  available: boolean;
}

interface GetAreaSlotsRequest {
  areaId: string;
  date: string;
}

interface GetAreaSlotsResponse {
  date: string;
  slots: AreaSlot[];
}

export async function getAreaSlots({ areaId, date }: GetAreaSlotsRequest) {
  const response = await api.get<GetAreaSlotsResponse>(`/areas/${areaId}/slots`, {
    params: { date },
  });

  return response.data;
}
