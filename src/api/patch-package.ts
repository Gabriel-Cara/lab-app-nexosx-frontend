import { api } from "@/lib/axios";

type PatchPackageParams = {
  id: string;
  code: string;
};

export function patchPackage({ id, code }: PatchPackageParams) {
  return api.patch(`/packages/${id}/retrieve`, {
    code,
  });
}
