import { api } from "@/lib/axios";
import type { Event } from "@/api/get-events";

export type PostEventBody = {
  title: string;
  description?: string;
  commonAreaId: string;
  capacity: number;
  startDate: string;
  endDate: string;
  allowBookings: boolean;
};

export async function postEvent(payload: PostEventBody) {
  const response = await api.post<Event>("/events", payload);
  return response.data;
}
