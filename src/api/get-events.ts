import { api } from "@/lib/axios";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  commonAreaId: string;
  capacity: number;
  allowBookings: boolean;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  createdById: string;
  createdBy: {
    name: string;
  };
  location: {
    id: string;
    name: string;
    capacity: number | null;
  };
  bookingsCount: number;
  likesCount: number;
  bookedByUser: boolean;
  likedByUser: boolean;
};

export async function getEvents() {
  const response = await api.get<Event[]>("/events");
  return response.data;
}
