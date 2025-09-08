
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { deleteMovimento, getMovimentos, getSetoristas } from '@/services/storageService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';

const MovimentosList = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoFinanceiro[]>([]);
  const [movimentoParaExcluir, setMovimentoParaExcluir] = useState<MovimentoFinanceiro | null>(null);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [movimentos, dataInicial, dataFinal, setoristaId]);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaMovimentos = await getMovimentos();
      
      // Adicionar informações do setorista
      const movimentosComSetorista = listaMovimentos.map(movimento => {
        const setorista = listaSetoristas.find(s => s.id === movimento.setoristaId);
        return {
          ...movimento,
          setorista
        };
      });
      
      setMovimentos(movimentosComSetorista);
      setMovimentosFiltrados(movimentosComSetorista);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...movimentos];

    if (dataInicial) {
      const dataIni = new Date(dataInicial);
      resultado = resultado.filter(m => m.data >= dataIni);
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal);
      dataFim.setHours(23, 59, 59);
      resultado = resultado.filter(m => m.data <= dataFim);
    }

    if (setoristaId) {
      resultado = resultado.filter(m => m.setoristaId === setoristaId);
    }

    setMovimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('');
  };

  const handleDelete = (movimento: MovimentoFinanceiro) => {
    setMovimentoParaExcluir(movimento);
  };

  const confirmarExclusao = () => {
    if (movimentoParaExcluir) {
      deleteMovimento(movimentoParaExcluir.id);
      carregarDados();
      toast.success('Movimento excluído com sucesso!');
      setMovimentoParaExcluir(null);
    }
  };

  const calcularTotais = () => {
    return movimentosFiltrados.reduce((totais, movimento) => ({
      vendas: totais.vendas + movimento.vendas,
      comissao: totais.comissao + movimento.comissao,
      premios: totais.premios + movimento.premios,
      despesas: totais.despesas + movimento.despesas,
      valorLiquido: totais.valorLiquido + movimento.valorLiquido
    }), {
      vendas: 0,
      comissao: 0,
      premios: 0,
      despesas: 0,
      valorLiquido: 0
    });
  };

  const totais = calcularTotais();

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ShoppingBag className="mr-2 h-8 w-8" />
              Movimentos Financeiros
            </h1>
            <p className="text-muted-foreground">
              Gerenciamento de movimentos financeiros
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/movimentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Movimento
            </Link>
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicial">Data Inicial</Label>
              <Input
                id="data-inicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-final">Data Final</Label>
              <Input
                id="data-final"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setorista">Setorista</Label>
              <SimpleSelect value={setoristaId} onValueChange={setSetoristaId} placeholder="Todos">
                <SimpleSelectItem value="todos">Todos</SimpleSelectItem>
                {setoristas.map((setorista) => (
                  <SimpleSelectItem key={setorista.id} value={setorista.id}>
                    {setorista.nome}
                  </SimpleSelectItem>
                ))}
              </SimpleSelect>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros} className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {movimentosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Prêmios</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentosFiltrados.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>{formatDate(movimento.data)}</TableCell>
                      <TableCell>{movimento.setorista?.nome || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.vendas)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.comissao)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.premios)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.despesas)}</TableCell>
                      <TableCell 
                        className="text-right font-medium"
                        style={{ 
                          color: movimento.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                        }}
                      >
                        {formatCurrency(movimento.valorLiquido)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/movimentos/editar/${movimento.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(movimento)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarExclusao}>
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.vendas)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.comissao)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.premios)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.despesas)}</TableCell>
                    <TableCell 
                      className="text-right font-bold"
                      style={{ 
                        color: totais.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                      }}
                    >
                      {formatCurrency(totais.valorLiquido)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum movimento encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovimentosList;
