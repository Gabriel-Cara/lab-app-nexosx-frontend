import { Users } from "lucide-react"
import { EmptyState } from "@/components/ui/empty"

export function EmptyOutline() {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum morador encontrado"
      description="Quando houver moradores cadastrados, eles aparecerão aqui."
      size="sm"
    />
  )
}
