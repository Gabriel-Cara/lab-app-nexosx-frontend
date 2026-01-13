import { api } from "@/lib/axios";

export type StaffMember = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  shift?: string | null;
  role: "admin" | "staff" | "resident";
  imageUrl?: string | null;
};

export type GetStaffParams = {
  limit?: number;
  search?: string;
  page?: number;
};

export type GetStaffResponse = {
  data: StaffMember[];
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

export async function getStaff(
  params?: GetStaffParams,
): Promise<GetStaffResponse> {
  const response = await api.get<StaffMember[]>("/auth/users", {
    params: {
      role: "staff",
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
