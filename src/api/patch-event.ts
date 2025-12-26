import { api } from "@/lib/axios";
import type { Event } from "@/api/get-events";

export type PatchEventBody = {
  id: string;
  title: string;
  description?: string;
  commonAreaId: string;
  capacity: number;
  startDate: string;
  endDate: string;
  allowBookings: boolean;
};

export async function patchEvent({ id, ...payload }: PatchEventBody) {
  const response = await api.patch<Event>(`/events/${id}`, payload);
  return response.data;
}
