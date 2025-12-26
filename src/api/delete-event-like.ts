import { api } from "@/lib/axios";

export async function deleteEventLike(eventId: string) {
  const response = await api.delete(`/events/${eventId}/like`);
  return response.data;
}
