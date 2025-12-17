import { api } from "@/lib/axios";
import type { AreaSlot } from "./get-area-slots";

export interface AreaWeekSlotsDay {
  date: string;
  slots: AreaSlot[];
  fullyBooked: boolean;
}

export interface AreaWeekSlotsResponse {
  areaId: string;
  startDate: string;
  endDate: string;
  fullyBookedDates: string[];
  days: AreaWeekSlotsDay[];
}

interface GetAreaWeekSlotsRequest {
  areaId: string;
  startDate: string;
  endDate?: string;
}

export async function getAreaWeekSlots({
  areaId,
  startDate,
  endDate,
}: GetAreaWeekSlotsRequest) {
  const response = await api.get<AreaWeekSlotsResponse>(
    `/areas/${areaId}/slots-range`,
    {
      params: {
        start: startDate,
        ...(endDate ? { end: endDate } : {}),
      },
    }
  );

  return response.data;
}
