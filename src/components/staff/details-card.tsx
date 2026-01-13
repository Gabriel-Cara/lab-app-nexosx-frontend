import { Clock, Mail, Phone } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteStaffModal } from "@/components/staff/delete-modal";
import { EditStaffModal } from "@/components/staff/edit-modal";
import { ResendInviteButton } from "@/components/residents/resend-invite-button";

interface StaffDetailsCardProps {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  shift?: string | null;
  imageUrl?: string | null;
}

export function StaffDetailsCard({
  id,
  name,
  email,
  phone,
  shift,
  imageUrl,
}: StaffDetailsCardProps) {
  const getInitials = (value: string) =>
    value
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
              <AvatarFallback className="bg-linear-to-br from-cyan-300 to-emerald-600 text-background">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-foreground">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">Equipe</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <EditStaffModal
              id={id}
              name={name}
              email={email ?? ""}
              phone={phone ?? ""}
              shift={shift ?? ""}
            />
            <ResendInviteButton userId={id} />
            <DeleteStaffModal id={id} name={name} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {email ?? "Sem e-mail"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {phone ?? "Sem telefone"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {shift ?? "Turno não informado"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
