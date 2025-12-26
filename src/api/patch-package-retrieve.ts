import { api } from "@/lib/axios";

type RetrievePackageParams = {
  id: string;
  code: string;
};

export function retrievePackage({ id, code }: RetrievePackageParams) {
  return api.patch(`/packages/${id}/retrieve`, {
    code,
  });
}
