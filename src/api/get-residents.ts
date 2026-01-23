import { api } from "@/lib/axios";

export type Resident = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  apartment: string | null;
  role: "admin" | "staff" | "resident";
  imageUrl?: string | null;
  building?: string | null;
  vehicles: ResidentVehicle[];
  emergencyContact?: string | null;
};

export type ResidentVehicle = {
  id: string;
  model: string;
  plate: string;
  year: number;
};

export type GetResidentsParams = {
  limit?: number;
  search?: string;
  page?: number;
};

export type GetResidentsResponse = {
  data: Resident[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
};

const parseHeaderNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

type ResidentApiResponse = Resident & {
  residents?: {
    building: string | null;
    vehicles: ResidentVehicle[];
    emergencyContact: string | null;
  } | null;
};

export async function getResidents(
  params?: GetResidentsParams,
): Promise<GetResidentsResponse> {
  const response = await api.get<ResidentApiResponse[]>("/auth/users", {
    params: {
      role: "resident",
      limit: params?.limit,
      page: params?.page,
      search: params?.search,
    },
  });

  const normalizedResidents: Resident[] = response.data.map((resident) => ({
    id: resident.id,
    name: resident.name,
    email: resident.email ?? null,
    phone: resident.phone ?? null,
    apartment: resident.apartment ?? null,
    role: resident.role,
    imageUrl: resident.imageUrl ?? null,
    building: resident.residents?.building ?? null,
    vehicles: resident.residents?.vehicles ?? [],
    emergencyContact: resident.residents?.emergencyContact ?? null,
  }));

  const total = parseHeaderNumber(
    response.headers["total-count"],
    response.data.length,
  );
  const limit = parseHeaderNumber(
    response.headers["limit"],
    params?.limit ?? response.data.length ?? 0,
  );
  const page = parseHeaderNumber(
    response.headers["page"],
    params?.page ?? 1,
  );
  const totalPages = parseHeaderNumber(
    response.headers["total-pages"],
    limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1,
  );

  return {
    data: normalizedResidents,
    pagination: {
      total,
      totalPages,
      page,
      limit,
    },
  };
}
