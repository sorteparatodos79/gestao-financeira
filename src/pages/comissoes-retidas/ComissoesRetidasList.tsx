import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getComissoesRetidas, deleteComissaoRetida } from '@/services/storageService';
import { ComissaoRetida } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Calendar, User, DollarSign } from 'lucide-react';

const ComissoesRetidasList = () => {
  const [comissoesRetidas, setComissoesRetidas] = useState<ComissaoRetida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarComissoesRetidas();
  }, []);

  const carregarComissoesRetidas = async () => {
    try {
      setLoading(true);
      const lista = await getComissoesRetidas();
      setComissoesRetidas(lista);
    } catch (error) {
      console.error('Erro ao carregar comissões retidas:', error);
      toast.error('Erro ao carregar comissões retidas');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comissoesRetidas.length}</div>
            <p className="text-xs text-muted-foreground">
              Comissões retidas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalComissoesRetidas)}</div>
            <p className="text-xs text-muted-foreground">
              Total em comissões retidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setoristas Únicos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(comissoesRetidas.map(c => c.setoristaId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Setoristas com comissões retidas
            </p>
          </CardContent>
        </Card>
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
