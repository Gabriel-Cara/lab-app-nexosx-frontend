type UserAPIRole = "admin" | "resident" | "staff";

type LoginAPIResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserAPIRole;
  };
};
