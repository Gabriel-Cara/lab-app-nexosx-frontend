import { Home, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";
import { ResendInviteButton } from "./resend-invite-button";

interface DetailsCardProps {
  id: string;
  name: string;
  apartment?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "admin" | "staff" | "resident";
  imageUrl?: string | null;
  password?: string;
  building?: string | null;
  vehicle?: string | null;
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
              <AvatarFallback className="bg-gradient-to-br from-sky-300 to-blue-600 text-background">
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
              vehicle={props.vehicle ?? ""}
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
      </CardContent>
    </Card>
  );
}
