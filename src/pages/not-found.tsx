import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen">
      <div className="flex items-center justify-center flex-col gap-4 size-full p-4">
        <h1 className="text-5xl text-foreground font-bold">Ops!</h1>
        <p className="text-muted-foreground text-center">
          Está página que vc está procurando não existe
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar para o início
        </Button>
      </div>
    </div>
  );
}
