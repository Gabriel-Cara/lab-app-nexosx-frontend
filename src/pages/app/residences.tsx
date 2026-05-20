import { Helmet } from "@dr.pogodin/react-helmet";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteResidence } from "@/api/delete-residence";
import { getBlocks } from "@/api/get-blocks";
import { getCondominiums } from "@/api/get-condominiums";
import { getResidences, type Residence } from "@/api/get-residences";
import { patchResidence } from "@/api/patch-residence";
import { postResidence } from "@/api/post-residence";
import { Badge } from "@/components/ui/badge";
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

export function Residences() {
  const { session } = useAuth();
  const role = session?.user.role;
  const isAdmin = role === "admin";
  const canManage = role === "admin" || role === "manager";
  const [selectedCondominiumId, setSelectedCondominiumId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [number, setNumber] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Residence | null>(null);
  const [editingNumber, setEditingNumber] = useState("");
  const [editingBlockId, setEditingBlockId] = useState("");
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

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks", condominiumId ?? "current"],
    queryFn: () => getBlocks(condominiumId),
    enabled: canLoad && canManage,
  });

  useEffect(() => {
    if (!selectedBlockId && blocks.length > 0) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [blocks, selectedBlockId]);

  const residencesQueryKey = useMemo(
    () => ["residences", condominiumId ?? "current", search],
    [condominiumId, search]
  );

  const { data: residences = [], isLoading, isError } = useQuery({
    queryKey: residencesQueryKey,
    queryFn: () => getResidences({ condominiumId, search: search || undefined }),
    enabled: canLoad,
  });

  const createMutation = useMutation({
    mutationFn: postResidence,
    onSuccess: async () => {
      setNumber("");
      await queryClient.invalidateQueries({ queryKey: ["residences"] });
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Residência criada com sucesso.");
    },
    onError: () => toast.error("Não foi possível criar a residência."),
  });

  const updateMutation = useMutation({
    mutationFn: patchResidence,
    onSuccess: async () => {
      setEditing(null);
      setEditingNumber("");
      setEditingBlockId("");
      await queryClient.invalidateQueries({ queryKey: ["residences"] });
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Residência atualizada com sucesso.");
    },
    onError: () => toast.error("Não foi possível atualizar a residência."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResidence(id, condominiumId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["residences"] });
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
      toast.success("Residência removida com sucesso.");
    },
    onError: () => toast.error("Não foi possível remover a residência."),
  });

  function handleCreate() {
    const trimmedNumber = number.trim();

    if (!trimmedNumber || !selectedBlockId) {
      toast.error("Informe o bloco e o número da residência.");
      return;
    }

    createMutation.mutate({
      number: trimmedNumber,
      blockId: selectedBlockId,
      condominiumId,
    });
  }

  function startEditing(residence: Residence) {
    setEditing(residence);
    setEditingNumber(residence.number);
    setEditingBlockId(residence.blockId);
  }

  function handleUpdate() {
    if (!editing) {
      return;
    }

    const trimmedNumber = editingNumber.trim();

    if (!trimmedNumber || !editingBlockId) {
      toast.error("Informe o bloco e o número da residência.");
      return;
    }

    updateMutation.mutate({
      id: editing.id,
      number: trimmedNumber,
      blockId: editingBlockId,
      condominiumId,
    });
  }

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Helmet>
        <title>Residências</title>
      </Helmet>

      <main className="flex min-h-svh flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Residências</h1>
            <p className="text-muted-foreground">
              Consulte e organize unidades vinculadas aos blocos do condomínio.
            </p>
          </div>

          {isAdmin && (
            <div className="flex min-w-64 flex-col gap-2">
              <Label htmlFor="condominium">Condomínio</Label>
              <select
                id="condominium"
                value={selectedCondominiumId}
                onChange={(event) => {
                  setSelectedCondominiumId(event.target.value);
                  setSelectedBlockId("");
                }}
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

        <section className="grid gap-4 rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-residence">Busca</Label>
            <Input
              id="search-residence"
              placeholder="Buscar por residência, bloco ou morador"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={!canLoad}
            />
          </div>

          {canManage && (
            <div className="grid gap-3 md:grid-cols-[minmax(180px,240px)_1fr_auto] md:items-end">
              <div className="flex flex-col gap-2">
                <Label htmlFor="block">Bloco</Label>
                <select
                  id="block"
                  value={selectedBlockId}
                  onChange={(event) => setSelectedBlockId(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  disabled={!canLoad || blocks.length === 0 || isBusy}
                >
                  {blocks.length === 0 ? (
                    <option value="">Cadastre um bloco primeiro</option>
                  ) : (
                    blocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="number">Nova residência</Label>
                <Input
                  id="number"
                  placeholder="Ex: 101, 12B, Casa 4"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  disabled={!canLoad || blocks.length === 0 || isBusy}
                />
              </div>
              <Button onClick={handleCreate} disabled={!canLoad || blocks.length === 0 || isBusy}>
                Adicionar residência
              </Button>
            </div>
          )}
        </section>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Residência</TableHead>
              <TableHead>Bloco</TableHead>
              <TableHead>Moradores</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!canLoad ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="text-center text-muted-foreground">
                  Selecione um condomínio para visualizar as residências.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="text-center text-muted-foreground">
                  Carregando residências...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="text-center text-destructive">
                  Não foi possível carregar as residências.
                </TableCell>
              </TableRow>
            ) : residences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="text-center text-muted-foreground">
                  Nenhuma residência encontrada.
                </TableCell>
              </TableRow>
            ) : (
              residences.map((residence) => (
                <TableRow key={residence.id}>
                  <TableCell className="font-medium">
                    {editing?.id === residence.id ? (
                      <Input
                        value={editingNumber}
                        onChange={(event) => setEditingNumber(event.target.value)}
                      />
                    ) : (
                      residence.number
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === residence.id ? (
                      <select
                        value={editingBlockId}
                        onChange={(event) => setEditingBlockId(event.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {blocks.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      residence.block.name
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {residence.residents.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Sem moradores</span>
                      ) : (
                        residence.residents.map((resident) => (
                          <Badge key={resident.id} variant="outline">
                            {resident.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {editing?.id === residence.id ? (
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
                          <Button size="sm" variant="outline" onClick={() => startEditing(residence)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(residence.id)}
                            disabled={isBusy}
                          >
                            Remover
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
