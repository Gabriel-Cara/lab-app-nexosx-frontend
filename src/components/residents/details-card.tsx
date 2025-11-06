import { Home, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";

interface DetailsCardProps {
  name: string
  apartment: string
  email: string
  phone: string
  role: 'admin' | 'staff' | 'resident'
  password?: string
  building?: string
  vehicle?: number
  emergencyContact?: string
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
            <EditModal {...props} />
            <DeleteModal />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            {props.apartment}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {props.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {props.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
