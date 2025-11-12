type StatusTaxa = 'Adimplente' | 'Inadimplente' | 'Pendente';
type TipoMorador = 'Morador' | 'Inquilino';

interface Morador {
  id: string;
  nome: string;
  unidade: string;
  fotoUrl?: string; // Foto é opcional
  tipo: TipoMorador;
  statusTaxa: StatusTaxa;
  dependentes: string[];
  observacoes?: string;
  contatos: {
    telefone: string;
    email: string;
  };
}