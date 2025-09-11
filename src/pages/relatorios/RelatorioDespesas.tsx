
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Despesa, Setorista, TipoDespesa } from '@/types/models';
import { getDespesas, getSetoristas } from '@/services/storageService';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowLeft, FileBarChart, Filter, X } from 'lucide-react';

// Cores para o gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const RelatorioDespesas = () => {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  const [tipoDespesa, setTipoDespesa] = useState('all');
  
  useEffect(() => {
    const listaSetoristas = getSetoristas();
    setSetoristas(listaSetoristas);
    
    const listaDespesas = getDespesas();
    // Ordenar por data (mais antigo primeiro)
    listaDespesas.sort((a, b) => a.data.getTime() - b.data.getTime());
    setDespesas(listaDespesas);
    setDespesasFiltradas(listaDespesas);
  }, []);
  
  useEffect(() => {
    aplicarFiltros();
  }, [despesas, dataInicial, dataFinal, setoristaId, tipoDespesa]);
  
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

    if (setoristaId !== 'all') {
      resultado = resultado.filter(d => d.setoristaId === setoristaId);
    }

    if (tipoDespesa !== 'all') {
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

  const calcularTotalDespesas = () => {
    return despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);
  };
  
  const prepararDadosPorTipo = () => {
    const dadosPorTipo: Record<string, number> = {};
    
    despesasFiltradas.forEach(despesa => {
      if (dadosPorTipo[despesa.tipoDespesa]) {
        dadosPorTipo[despesa.tipoDespesa] += despesa.valor;
      } else {
        dadosPorTipo[despesa.tipoDespesa] = despesa.valor;
      }
    });
    
    return Object.entries(dadosPorTipo).map(([tipo, valor]) => ({
      tipo,
      valor
    }));
  };
  
  const prepararDadosPorSetorista = () => {
    const dadosPorSetorista: Record<string, number> = {};
    
    despesasFiltradas.forEach(despesa => {
      const setorista = setoristas.find(s => s.id === despesa.setoristaId);
      const nome = setorista ? setorista.nome : 'Desconhecido';
      
      if (dadosPorSetorista[nome]) {
        dadosPorSetorista[nome] += despesa.valor;
      } else {
        dadosPorSetorista[nome] = despesa.valor;
      }
    });
    
    return Object.entries(dadosPorSetorista).map(([nome, valor]) => ({
      nome,
      valor
    }));
  };
  
  const dadosPorTipo = prepararDadosPorTipo();
  const dadosPorSetorista = prepararDadosPorSetorista();

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => navigate('/relatorios')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar para Relatórios
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <FileBarChart className="mr-3 h-8 w-8" />
              Relatório de Despesas
            </h1>
            <p className="text-muted-foreground">
              Análise detalhada das despesas registradas no sistema
            </p>
          </div>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
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
            <Button variant="outline" onClick={limparFiltros} className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dadosPorTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="tipo"
                      label={({ tipo, valor }) => `${tipo}: ${formatCurrency(valor)}`}
                    >
                      {dadosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível para exibir no gráfico.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Setorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dadosPorSetorista.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorSetorista}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível para exibir no gráfico.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detalhamento de Despesas</span>
            <span className="text-base font-normal">
              Total: <strong>{formatCurrency(calcularTotalDespesas())}</strong>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {despesasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesasFiltradas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell>
                        {format(despesa.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {setoristas.find(s => s.id === despesa.setoristaId)?.nome || 'Não encontrado'}
                      </TableCell>
                      <TableCell>{despesa.tipoDespesa}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(despesa.valor)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {despesa.descricao || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado com os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioDespesas;
