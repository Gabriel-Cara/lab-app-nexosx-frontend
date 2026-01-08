export type UserRole = "admin" | "resident" | "staff" | "master";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  condominiumId?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
