import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  getDespesas, 
  deleteDespesa, 
  getSetoristas 
} from '@/services/storageService';
import { Despesa, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Download, Edit, Plus, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePrintHandler } from '@/utils/printUtils';

const DespesasList = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { printHandler } = usePrintHandler(printRef, 'Lista de Despesas');
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  const [tipoDespesa, setTipoDespesa] = useState('all');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [despesas, dataInicial, dataFinal, setoristaId, tipoDespesa]);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaDespesas = await getDespesas();
      
      // Adicionar informações do setorista
      const despesasComSetorista = listaDespesas.map(despesa => {
        const setorista = listaSetoristas.find(s => s.id === despesa.setoristaId);
        return {
          ...despesa,
          setorista
        };
      });
      
      // Ordenar por data (mais recente primeiro)
      despesasComSetorista.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setDespesas(despesasComSetorista);
      setDespesasFiltradas(despesasComSetorista);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...despesas];

    if (dataInicial) {
      const dataIni = new Date(dataInicial);
      resultado = resultado.filter(d => d.data >= dataIni);
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal);
      dataFim.setHours(23, 59, 59);
      resultado = resultado.filter(d => d.data <= dataFim);
    }

    if (setoristaId && setoristaId !== 'all') {
      resultado = resultado.filter(d => d.setoristaId === setoristaId);
    }

    if (tipoDespesa && tipoDespesa !== 'all') {
      resultado = resultado.filter(d => d.tipoDespesa === tipoDespesa);
    }

    setDespesasFiltradas(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
    setTipoDespesa('all');
  };

  const handleEditar = (id: string) => {
    navigate(`/despesas/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteDespesa(id);
    setDespesas(prevDespesas => prevDespesas.filter(despesa => despesa.id !== id));
    setDespesasFiltradas(prevDespesas => prevDespesas.filter(despesa => despesa.id !== id));
    toast.success('Despesa excluída com sucesso!');
  };

  const calcularTotal = () => {
    return despesasFiltradas.reduce((acc, despesa) => acc + despesa.valor, 0);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Despesas</h1>
            <p className="text-muted-foreground">
              Gerencie as despesas do seu negócio
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={printHandler}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="default" onClick={printHandler}>
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
            <Button onClick={() => navigate('/despesas/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
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
              <Label htmlFor="tipo-despesa">Tipo de Despesa</Label>
              <SimpleSelect value={tipoDespesa} onValueChange={setTipoDespesa} placeholder="Todos">
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                <SimpleSelectItem value="Salario Mensal">Salario Mensal</SimpleSelectItem>
                <SimpleSelectItem value="Quinzena">Quinzena</SimpleSelectItem>
                <SimpleSelectItem value="Comissão">Comissão</SimpleSelectItem>
                <SimpleSelectItem value="Internet">Internet</SimpleSelectItem>
                <SimpleSelectItem value="Aluguel">Aluguel</SimpleSelectItem>
                <SimpleSelectItem value="Ajuda de Custos">Ajuda de Custos</SimpleSelectItem>
                <SimpleSelectItem value="Combustivel">Combustivel</SimpleSelectItem>
                <SimpleSelectItem value="Material de Limpeza">Material de Limpeza</SimpleSelectItem>
                <SimpleSelectItem value="Alimentação">Alimentação</SimpleSelectItem>
                <SimpleSelectItem value="Sistema">Sistema</SimpleSelectItem>
                <SimpleSelectItem value="Chips">Chips</SimpleSelectItem>
                <SimpleSelectItem value="Descarrego">Descarrego</SimpleSelectItem>
                <SimpleSelectItem value="Outros">Outros</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Conteúdo que será impresso/gerado como PDF */}
      <div ref={printRef} className="p-4">
        <div className="print-header mb-8">
          <h1 className="text-2xl font-bold text-center">Lista de Despesas</h1>
          {dataInicial && dataFinal && (
            <p className="text-center text-muted-foreground">
              Período: {new Date(dataInicial).toLocaleDateString()} a {new Date(dataFinal).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Despesas</span>
              <span className="text-base font-normal">
                Total: <strong>{formatCurrency(calcularTotal())}</strong>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {despesasFiltradas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesasFiltradas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell>{formatDate(despesa.data)}</TableCell>
                      <TableCell>{despesa.setorista?.nome || 'N/A'}</TableCell>
                      <TableCell>{despesa.tipoDespesa}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(despesa.valor)}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {despesa.descricao || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditar(despesa.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(despesa.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(calcularTotal())}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma despesa encontrada com os filtros aplicados.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DespesasList;
