import { Helmet } from "@dr.pogodin/react-helmet";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteBlock } from "@/api/delete-block";
import { getBlocks, type Block } from "@/api/get-blocks";
import { getCondominiums } from "@/api/get-condominiums";
import { patchBlock } from "@/api/patch-block";
import { postBlock } from "@/api/post-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";

export function Blocks() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "admin";
  const [selectedCondominiumId, setSelectedCondominiumId] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Block | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();

  const { data: condominiums = [] } = useQuery({
    queryKey: ["condominiums"],
    queryFn: getCondominiums,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (isAdmin && !selectedCondominiumId && condominiums.length > 0) {
      setSelectedCondominiumId(condominiums[0].id);
    }
  }, [condominiums, isAdmin, selectedCondominiumId]);

  const condominiumId = isAdmin ? selectedCondominiumId : undefined;
  const canLoad = !isAdmin || Boolean(condominiumId);

  const blocksQueryKey = useMemo(
    () => ["blocks", condominiumId ?? "current"],
    [condominiumId]
  );

  const { data: blocks = [], isLoading, isError } = useQuery({
    queryKey: blocksQueryKey,
    queryFn: () => getBlocks(condominiumId),
    enabled: canLoad,
  });

  const createMutation = useMutation({
    mutationFn: postBlock,
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Bloco criado com sucesso.");
    },
    onError: () => toast.error("Não foi possível criar o bloco."),
  });

  const updateMutation = useMutation({
    mutationFn: patchBlock,
    onSuccess: async () => {
      setEditing(null);
      setEditingName("");
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Bloco atualizado com sucesso.");
    },
    onError: () => toast.error("Não foi possível atualizar o bloco."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlock(id, condominiumId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Bloco removido com sucesso.");
    },
    onError: () => toast.error("Não foi possível remover o bloco."),
  });

  function handleCreate() {
    const trimmed = name.trim();

    if (!trimmed) {
      toast.error("Informe o nome do bloco.");
      return;
    }

    createMutation.mutate({ name: trimmed, condominiumId });
  }

  function startEditing(block: Block) {
    setEditing(block);
    setEditingName(block.name);
  }

  function handleUpdate() {
    if (!editing) {
      return;
    }

    const trimmed = editingName.trim();

    if (!trimmed) {
      toast.error("Informe o nome do bloco.");
      return;
    }

    updateMutation.mutate({ id: editing.id, name: trimmed, condominiumId });
  }

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Helmet>
        <title>Blocos</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blocos</h1>
            <p className="text-muted-foreground">
              Organize os blocos ou torres de cada condomínio.
            </p>
          </div>

          {isAdmin && (
            <div className="flex min-w-64 flex-col gap-2">
              <Label htmlFor="condominium">Condomínio</Label>
              <select
                id="condominium"
                value={selectedCondominiumId}
                onChange={(event) => setSelectedCondominiumId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {condominiums.map((condominium) => (
                  <option key={condominium.id} value={condominium.id}>
                    {condominium.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        <section className="rounded-xl border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="block-name">Novo bloco</Label>
              <Input
                id="block-name"
                placeholder="Ex: Torre A, Bloco 1"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!canLoad || isBusy}
              />
            </div>
            <Button onClick={handleCreate} disabled={!canLoad || isBusy}>
              Adicionar bloco
            </Button>
          </div>
        </section>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Residências</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!canLoad ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Selecione um condomínio para visualizar os blocos.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Carregando blocos...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-destructive">
                  Não foi possível carregar os blocos.
                </TableCell>
              </TableRow>
            ) : blocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhum bloco cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-medium">
                    {editing?.id === block.id ? (
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                    ) : (
                      block.name
                    )}
                  </TableCell>
                  <TableCell>{block._count?.residences ?? 0}</TableCell>
                  <TableCell className="text-right">
                    {editing?.id === block.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={handleUpdate} disabled={isBusy}>
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(null)}
                          disabled={isBusy}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEditing(block)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(block.id)}
                          disabled={isBusy}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
