import { api } from "@/lib/axios";

export async function deleteEvent(eventId: string) {
  await api.delete(`/events/${eventId}`);
}
