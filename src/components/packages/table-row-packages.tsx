import { TableCell, TableRow } from "../ui/table";
import { StatusPackages } from "./status-packages";
import { TypePackages } from "./type-packages";
import type { Package } from "@/api/get-packages";
import { RetrieveModal } from "./retrieve-modal";
import { useAuth } from "@/hooks/use-auth";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";

type TableRowPackagesProps = {
  pkg: Package;
};

export function TableRowPackages({ pkg }: TableRowPackagesProps) {
  const { session } = useAuth();

  const { resident, carrier, type, status } = pkg;
  const canRetrieve = status === "pending" || status === "delayed";
  const canManage = session?.user.role !== "resident";

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
        {canManage && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {canRetrieve && <RetrieveModal id={pkg.id} />}
            <EditModal
              id={pkg.id}
              residentId={pkg.residentId}
              residentName={pkg.resident.name}
              carrier={pkg.carrier}
              description={pkg.description}
              type={pkg.type}
            />
            <DeleteModal
              id={pkg.id}
              residentName={pkg.resident.name}
              description={pkg.description}
            />
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
