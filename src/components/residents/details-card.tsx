import { Building, Car, Home, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";
import { ResendInviteButton } from "./resend-invite-button";
import {
  formatParkingSpot,
  formatVehiclePlate,
} from "@/utils/vehicle-plate";

interface DetailsCardProps {
  id: string;
  name: string;
  apartment?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "manager" | "doorman" | "resident";
  imageUrl?: string | null;
  password?: string;
  building?: string | null;
  vehicles?: {
    id?: string;
    model: string;
    plate: string;
    parkingSpot?: string | null;
    year: number;
  }[] | null;
  emergencyContact?: string | null;
}

export function DetailsCard(props: DetailsCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {props.imageUrl && (
                <AvatarImage src={props.imageUrl} alt={props.name} />
              )}
              <AvatarFallback className="bg-linear-to-br from-lime-300 to-teal-600 text-background">
                {getInitials(props.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-foreground">{props.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Morador</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <EditModal
              id={props.id}
              name={props.name}
              email={props.email ?? ""}
              phone={props.phone ?? ""}
              role={props.role}
              apartment={props.apartment ?? ""}
              password=""
              building={props.building ?? ""}
              vehicles={
                props.vehicles?.map((vehicle) => ({
                  model: vehicle.model,
                  plate: vehicle.plate,
                  parkingSpot: vehicle.parkingSpot ?? "",
                  year: vehicle.year,
                })) ?? []
              }
              emergencyContact={props.emergencyContact ?? ""}
              imageUrl={props.imageUrl}
            />
            <DeleteModal id={props.id} name={props.name} />
            <ResendInviteButton userId={props.id} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            {props.apartment ?? "Sem apartamento"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {props.email ?? "Sem e-mail"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {props.phone ?? "Sem telefone"}
          </div>
        </div>

        {(props.building || props.emergencyContact || props.vehicles?.length) ? (
          <div className="mt-4 space-y-3 border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Informações adicionais
            </p>

            {props.building && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="w-4 h-4" />
                Torre {props.building}
              </div>
            )}

            {props.emergencyContact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {props.emergencyContact}
              </div>
            )}

            {props.vehicles && props.vehicles.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Car className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex flex-wrap gap-2">
                  {props.vehicles.map((vehicle) => (
                    <Badge
                      key={
                        vehicle.id ??
                        `${vehicle.model}-${vehicle.plate}-${vehicle.year}`
                      }
                      variant="outline"
                    >
                      {vehicle.model ? `${vehicle.model} · ` : ""}
                      {formatVehiclePlate(vehicle.plate)}
                      {vehicle.parkingSpot
                        ? ` · vaga ${formatParkingSpot(vehicle.parkingSpot)}`
                        : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
