import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getComissoesRetidas, deleteComissaoRetida, getSetoristas } from '@/services/storageService';
import { ComissaoRetida, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ComissoesRetidasList = () => {
  const [comissoesRetidas, setComissoesRetidas] = useState<ComissaoRetida[]>([]);
  const [loading, setLoading] = useState(true);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  // Filtros de data (padrão: mês atual)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const toInput = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return { ini: toInput(first), fim: toInput(last) };
  };
  const currentRange = getCurrentMonthRange();
  const [dataInicial, setDataInicial] = useState(currentRange.ini);
  const [dataFinal, setDataFinal] = useState(currentRange.fim);
  const [setoristaId, setSetoristaId] = useState<string>('all');

  useEffect(() => {
    carregarComissoesRetidas();
    getSetoristas().then(setSetoristas).catch(() => {});
  }, []);

  const carregarComissoesRetidas = async () => {
    try {
      setLoading(true);
      const lista = await getComissoesRetidas();
      // aplicar filtro do intervalo selecionado e setorista (se houver)
      const ini = new Date(dataInicial + 'T00:00:00');
      const fim = new Date(dataFinal + 'T23:59:59');
      const filtrada = lista.filter(c => {
        const d = new Date(c.data);
        const inRange = d >= ini && d <= fim;
        const matchSetorista = setoristaId === 'all' || c.setoristaId === setoristaId;
        return inRange && matchSetorista;
      });
      setComissoesRetidas(filtrada);
    } catch (error) {
      console.error('Erro ao carregar comissões retidas:', error);
      toast.error('Erro ao carregar comissões retidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComissoesRetidas();
  }, [dataInicial, dataFinal, setoristaId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteComissaoRetida(id);
      toast.success('Comissão retida excluída com sucesso!');
      carregarComissoesRetidas();
    } catch (error) {
      console.error('Erro ao excluir comissão retida:', error);
      toast.error('Erro ao excluir comissão retida');
    }
  };

  const totalComissoesRetidas = comissoesRetidas.reduce((total, comissao) => total + comissao.valor, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando comissões retidas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicial">Data inicial</Label>
              <Input id="data-inicial" type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-final">Data final</Label>
              <Input id="data-final" type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Setorista</Label>
              <SimpleSelect value={setoristaId} onValueChange={setSetoristaId} placeholder="Todos">
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                {setoristas.map((s) => (
                  <SimpleSelectItem key={s.id} value={s.id}>{s.nome}</SimpleSelectItem>
                ))}
              </SimpleSelect>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  const r = getCurrentMonthRange();
                  setDataInicial(r.ini);
                  setDataFinal(r.fim);
                  setSetoristaId('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comissões Retidas</h1>
          <p className="text-muted-foreground">
            Gerencie as comissões retidas dos setoristas
          </p>
        </div>
        <Button asChild>
          <Link to="/comissoes-retidas/novo">
            <Plus className="h-4 w-4 mr-2" />
            Nova Comissão Retida
          </Link>
        </Button>
      </div>


      {/* Tabela de comissões retidas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comissões Retidas</CardTitle>
        </CardHeader>
        <CardContent>
          {comissoesRetidas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                Nenhuma comissão retida cadastrada
              </div>
              <Button asChild>
                <Link to="/comissoes-retidas/novo">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Comissão Retida
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoesRetidas.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">
                        {formatDate(comissao.data)}
                      </TableCell>
                      <TableCell>
                        {comissao.setorista?.nome || 'Setorista não encontrado'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(comissao.valor)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {comissao.descricao || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/comissoes-retidas/editar/${comissao.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta comissão retida? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(comissao.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComissoesRetidasList;
