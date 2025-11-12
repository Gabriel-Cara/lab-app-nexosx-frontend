import { api } from "@/lib/axios";

export type Resident = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  apartment: string | null;
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

export async function getResidents(
  params?: GetResidentsParams,
): Promise<GetResidentsResponse> {
  const response = await api.get<Resident[]>("/auth/users", {
    params: {
      role: "resident",
      limit: params?.limit,
      page: params?.page,
      search: params?.search,
    },
  });

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

  console.log(response.data);

  return {
    data: response.data,
    pagination: {
      total,
      totalPages,
      page,
      limit,
    },
  };
}
