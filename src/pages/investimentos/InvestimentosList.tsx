import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { 
  getInvestimentos, 
  getSetoristas,
  deleteInvestimento
} from '@/services/storageService';
import { Investimento, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { Edit, Plus, Trash2, Printer, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InvestimentosList = () => {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [investimentosFiltrados, setInvestimentosFiltrados] = useState<Investimento[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  const [tipoInvestimento, setTipoInvestimento] = useState('all');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [investimentos, dataInicial, dataFinal, setoristaId, tipoInvestimento]);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaInvestimentos = await getInvestimentos();
      
      // Adicionar informações do setorista
      const investimentosComSetorista = listaInvestimentos.map(investimento => {
        const setorista = listaSetoristas.find(s => s.id === investimento.setoristaId);
        return {
          ...investimento,
          setorista
        };
      });
      
      // Ordenar por data (mais recente primeiro)
      investimentosComSetorista.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setInvestimentos(investimentosComSetorista);
      setInvestimentosFiltrados(investimentosComSetorista);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...investimentos];

    if (dataInicial) {
      const dataIni = new Date(dataInicial);
      resultado = resultado.filter(i => i.data >= dataIni);
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal);
      dataFim.setHours(23, 59, 59);
      resultado = resultado.filter(i => i.data <= dataFim);
    }

    if (setoristaId && setoristaId !== 'all') {
      resultado = resultado.filter(i => i.setoristaId === setoristaId);
    }

    if (tipoInvestimento && tipoInvestimento !== 'all') {
      resultado = resultado.filter(i => i.tipoInvestimento === tipoInvestimento);
    }

    setInvestimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
    setTipoInvestimento('all');
  };

  const handleDelete = (id: string) => {
    deleteInvestimento(id);
    carregarDados();
    toast.success('Investimento excluído com sucesso!');
  };

  const calcularTotal = () => {
    return investimentosFiltrados.reduce((acc, investimento) => acc + investimento.valor, 0);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Investimentos</h1>
            <p className="text-muted-foreground">
              Gerencie os investimentos do seu negócio
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Link to="/investimentos/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                {setoristas.map((setorista) => (
                  <SimpleSelectItem key={setorista.id} value={setorista.id}>
                    {setorista.nome}
                  </SimpleSelectItem>
                ))}
              </SimpleSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo-investimento">Tipo de Investimento</Label>
              <SimpleSelect value={tipoInvestimento} onValueChange={setTipoInvestimento} placeholder="Todos">
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                <SimpleSelectItem value="Aquisição de Vendedores">Aquisição de Vendedores</SimpleSelectItem>
                <SimpleSelectItem value="Equipamento">Equipamento</SimpleSelectItem>
                <SimpleSelectItem value="Publicidade">Publicidade</SimpleSelectItem>
                <SimpleSelectItem value="Desenvolvimento de Software">Desenvolvimento de Software</SimpleSelectItem>
                <SimpleSelectItem value="Treinamento">Treinamento</SimpleSelectItem>
                <SimpleSelectItem value="Infraestrutura">Infraestrutura</SimpleSelectItem>
                <SimpleSelectItem value="Outros">Outros</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <div ref={printRef} className="p-4">
        <Table>
          <TableCaption>
            Lista de investimentos
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Setorista</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investimentosFiltrados.length > 0 ? (
              investimentosFiltrados.map((investimento) => (
                <TableRow key={investimento.id}>
                  <TableCell>{formatDate(investimento.data)}</TableCell>
                  <TableCell>{investimento.setorista?.nome || 'N/A'}</TableCell>
                  <TableCell>{investimento.tipoInvestimento}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(investimento.valor)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{investimento.descricao || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/investimentos/editar/${investimento.id}`}>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá excluir o investimento permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(investimento.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhum investimento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(calcularTotal())}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default InvestimentosList;
