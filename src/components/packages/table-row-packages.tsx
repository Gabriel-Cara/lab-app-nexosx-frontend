import { TableCell, TableRow } from "../ui/table";
import { StatusPackages } from "./status-packages";
import { TypePackages } from "./type-packages";
import type { Package } from "@/api/get-packages";
import { RetrieveModal } from "./retrieve-modal";

type TableRowPackagesProps = {
  pkg: Package;
};

export function TableRowPackages({ pkg }: TableRowPackagesProps) {
  const { resident, carrier, type, status } = pkg;

  return (
    <TableRow>
      <TableCell>{resident.name}</TableCell>
      <TableCell>{resident.apartment ?? "—"}</TableCell>
      <TableCell>{carrier ?? "—"}</TableCell>
      <TableCell>
        <TypePackages variant={type} />
      </TableCell>
      <TableCell>
        <StatusPackages variant={status} />
      </TableCell>
      <TableCell className="text-center">
        {status === "pending" && (
          <RetrieveModal id={pkg.id} />
        )}
      </TableCell>
    </TableRow>
  );
}
