import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { getMovimentos, getSetoristas } from '@/services/storageService';
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
import { Textarea } from '@/components/ui/textarea';
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ArrowLeft, FileBarChart, Filter, PencilIcon, SaveIcon, X } from 'lucide-react';

const RelatorioMovimentos = () => {
  const navigate = useNavigate();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoFinanceiro[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState(() => {
    // Padão: primeiro dia do mês passado
    const data = startOfMonth(subMonths(new Date(), 1));
    return format(data, 'yyyy-MM-dd');
  });
  const [dataFinal, setDataFinal] = useState(() => {
    // Padrão: último dia do mês atual
    const data = endOfMonth(new Date());
    return format(data, 'yyyy-MM-dd');
  });
  const [setoristaId, setSetoristaId] = useState('all');

  // Desconto Extra
  const [descontoExtra, setDescontoExtra] = useState<number>(0);
  const [descontoDescricao, setDescontoDescricao] = useState<string>("");
  const [editandoDesconto, setEditandoDesconto] = useState<boolean>(false);
  const [descontoTemporario, setDescontoTemporario] = useState<string>("0");
  const [descontoDescricaoTemp, setDescontoDescricaoTemp] = useState<string>("");
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const listaSetoristas = await getSetoristas();
        setSetoristas(listaSetoristas);
        
        const listaMovimentos = await getMovimentos();
        // Ordenar por data (mais recente primeiro)
        listaMovimentos.sort((a, b) => b.data.getTime() - a.data.getTime());
        setMovimentos(listaMovimentos);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    carregarDados();
  }, []);
  
  useEffect(() => {
    aplicarFiltros();
  }, [movimentos, dataInicial, dataFinal, setoristaId]);
  
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

    if (setoristaId !== 'all') {
      resultado = resultado.filter(m => m.setoristaId === setoristaId);
    }

    setMovimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    // Voltar para os filtros padrão
    const dataIni = startOfMonth(subMonths(new Date(), 1));
    setDataInicial(format(dataIni, 'yyyy-MM-dd'));
    
    const dataFim = endOfMonth(new Date());
    setDataFinal(format(dataFim, 'yyyy-MM-dd'));
    
    setSetoristaId('all');
  };

  const handleSalvarDesconto = () => {
    setDescontoExtra(Number(descontoTemporario) || 0);
    setDescontoDescricao(descontoDescricaoTemp);
    setEditandoDesconto(false);
  };

  const handleCancelarEdicao = () => {
    setDescontoTemporario(descontoExtra.toString());
    setDescontoDescricaoTemp(descontoDescricao);
    setEditandoDesconto(false);
  };

  const handleEditarDesconto = () => {
    setDescontoTemporario(descontoExtra.toString());
    setDescontoDescricaoTemp(descontoDescricao);
    setEditandoDesconto(true);
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

  const calcularResultadoFinal = (valorLiquido: number) => {
    return valorLiquido - descontoExtra;
  };
  
  const prepararDadosEvolucao = () => {
    // Ordenar por data (mais antigo primeiro)
    const movimentosOrdenados = [...movimentosFiltrados].sort((a, b) => 
      a.data.getTime() - b.data.getTime()
    );
    
    return movimentosOrdenados.map(movimento => {
      const dataFormatada = format(movimento.data, 'dd/MM');
      return {
        data: dataFormatada,
        vendas: movimento.vendas,
        lucro: movimento.valorLiquido
      };
    });
  };
  
  const prepararDesempenhoPorSetorista = () => {
    const dadosPorSetorista: Record<string, { 
      vendas: number;
      comissao: number;
      premios: number;
      lucro: number;
    }> = {};
    
    movimentosFiltrados.forEach(movimento => {
      const setorista = setoristas.find(s => s.id === movimento.setoristaId);
      const nome = setorista ? setorista.nome : 'Desconhecido';
      
      if (!dadosPorSetorista[nome]) {
        dadosPorSetorista[nome] = {
          vendas: 0,
          comissao: 0,
          premios: 0,
          lucro: 0
        };
      }
      
      dadosPorSetorista[nome].vendas += movimento.vendas;
      dadosPorSetorista[nome].comissao += movimento.comissao;
      dadosPorSetorista[nome].premios += movimento.premios;
      dadosPorSetorista[nome].lucro += movimento.valorLiquido;
    });
    
    return Object.entries(dadosPorSetorista).map(([nome, dados]) => ({
      nome,
      ...dados
    }));
  };
  
  const dadosEvolucao = prepararDadosEvolucao();
  const dadosDesempenho = prepararDesempenhoPorSetorista();
  const totais = calcularTotais();

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
              Relatório de Movimentos Financeiros
            </h1>
            <p className="text-muted-foreground">
              Análise detalhada dos movimentos financeiros registrados no sistema
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
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas e Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dadosEvolucao.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="vendas" 
                      name="Vendas" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      name="Lucro" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
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
            <CardTitle>Desempenho por Setorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dadosDesempenho.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosDesempenho}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="vendas" name="Vendas" fill="#8884d8" />
                    <Bar dataKey="lucro" name="Lucro" fill="#82ca9d" />
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-muted/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatCurrency(totais.vendas)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total de Comissões</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatCurrency(totais.comissao)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total de Prêmios</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatCurrency(totais.premios)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatCurrency(totais.despesas)}</p>
              </CardContent>
            </Card>
            <Card className={totais.valorLiquido >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Valor Líquido</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className={`text-2xl font-bold ${totais.valorLiquido >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {formatCurrency(totais.valorLiquido)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detalhamento de Movimentos</span>
            <span className="text-sm font-normal text-muted-foreground">
              {movimentosFiltrados.length} registro(s) encontrado(s)
            </span>
          </CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentosFiltrados.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>
                        {format(movimento.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {setoristas.find(s => s.id === movimento.setoristaId)?.nome || 'Não encontrado'}
                      </TableCell>
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
                  </TableRow>
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

      <Card>
        <CardHeader>
          <CardTitle>Resumo Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor Líquido:</span>
              <span className="font-bold" style={{ 
                color: totais.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
              }}>
                {formatCurrency(totais.valorLiquido)}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">(-) Desconto Extra:</span>
                  {!editandoDesconto && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={handleEditarDesconto}
                      className="h-6 w-6 ml-1"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {descontoDescricao && !editandoDesconto && (
                  <p className="text-sm text-muted-foreground ml-4">{descontoDescricao}</p>
                )}
                
                {editandoDesconto && (
                  <div className="space-y-4 mt-2 mb-2">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="valor-desconto">Valor</Label>
                      <Input
                        id="valor-desconto"
                        className="w-full"
                        value={descontoTemporario}
                        onChange={(e) => setDescontoTemporario(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>
                    
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="descricao-desconto">Descrição</Label>
                      <Textarea
                        id="descricao-desconto"
                        className="resize-none"
                        placeholder="Informe o motivo do desconto extra"
                        value={descontoDescricaoTemp}
                        onChange={(e) => setDescontoDescricaoTemp(e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={handleCancelarEdicao}>
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSalvarDesconto}>
                        <SaveIcon className="h-4 w-4 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <span className="font-bold text-destructive shrink-0">
                -{formatCurrency(descontoExtra)}
              </span>
            </div>
            
            <div className="pt-2 border-t flex justify-between items-center">
              <span className="font-bold">RESULTADO FINAL:</span>
              <span className="font-bold text-xl" style={{ 
                color: calcularResultadoFinal(totais.valorLiquido) >= 0 ? 'var(--success)' : 'var(--destructive)' 
              }}>
                {formatCurrency(calcularResultadoFinal(totais.valorLiquido))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioMovimentos;
