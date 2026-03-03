import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Package as PackageIcon, Truck } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { StatusPackages } from "./status-packages";
import { TypePackages } from "./type-packages";
import type { Package } from "@/api/get-packages";
import { RetrieveModal } from "./retrieve-modal";
import { useAuth } from "@/hooks/use-auth";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";
import { ResendCodeButton } from "./resend-code-button";

type TableRowPackagesProps = {
  pkg: Package;
};

function formatReceivedAt(value: string) {
  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return "Data de recebimento inválida";
  }

  return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function TableRowPackages({ pkg }: TableRowPackagesProps) {
  const { session } = useAuth();

  const { resident, carrier, type, status } = pkg;
  const canRetrieve = status === "pending" || status === "delayed";
  const canManage = session?.user.role !== "resident";

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{resident.name}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {resident.apartment ? `Apt ${resident.apartment}` : "Sem apartamento"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TypePackages variant={type} />
            <StatusPackages variant={status} />
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            {carrier ?? "Sem remetente"}
          </p>
          <p className="flex items-start gap-2">
            <PackageIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{pkg.description}</span>
          </p>
          <p className="text-xs">Recebida em {formatReceivedAt(pkg.receivedAt)}</p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {canRetrieve && <RetrieveModal id={pkg.id} />}
            {canRetrieve && <ResendCodeButton packageId={pkg.id} />}
            <EditModal
              id={pkg.id}
              residentId={pkg.residentId}
              residentName={pkg.resident.name}
              carrier={pkg.carrier}
              description={pkg.description}
              type={pkg.type}
              imageUrl={pkg.imageUrl}
            />
            <DeleteModal
              id={pkg.id}
              residentName={pkg.resident.name}
              description={pkg.description}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
