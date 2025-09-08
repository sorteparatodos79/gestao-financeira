
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useIsMobile } from "@/hooks/use-mobile";
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
  getSetoristas, 
  getMovimentos, 
  getDespesas,
  getInvestimentos
} from "@/services/storageService";
import { 
  MovimentoFinanceiro, 
  Setorista,
  Despesa,
  Investimento,
  ExtraDiscount
} from "@/types/models";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DownloadIcon, PencilIcon, PrinterIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { usePrintHandler } from '@/utils/printUtils';

const Index = () => {
  const isMobile = useIsMobile();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [mostrarInvestimentos, setMostrarInvestimentos] = useState<boolean>(false);
  const [resumoSetoristas, setResumoSetoristas] = useState<{
    id: string;
    nome: string;
    vendas: number;
    comissao: number;
    comissaoRetida: number;
    premios: number;
    despesas: number;
    valorLiquido: number;
  }[]>([]);
  const [resumoDiario, setResumoDiario] = useState<{
    data: string;
    vendas: number;
    comissao: number;
    comissaoRetida: number;
    premios: number;
    despesas: number;
    valorLiquido: number;
  }[]>([]);
  const [filtroMes, setFiltroMes] = useState<string>(() => {
    const dataAtual = new Date();
    return `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState<string>("setoristas");
  const [extraDiscounts, setExtraDiscounts] = useState<ExtraDiscount[]>([]);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [tempDiscountValue, setTempDiscountValue] = useState<string>("0");
  const [tempDiscountDescription, setTempDiscountDescription] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);
  const { printHandler } = usePrintHandler(printRef, 'Dashboard Financeiro');

  const handleAddNewDiscount = () => {
    setEditingDiscountId('new');
    setTempDiscountValue("0");
    setTempDiscountDescription("");
  };

  const handleSaveDiscount = () => {
    const value = Number(tempDiscountValue) || 0;
    
    if (editingDiscountId === 'new') {
      setExtraDiscounts([
        ...extraDiscounts,
        {
          id: crypto.randomUUID(),
          value,
          description: tempDiscountDescription
        }
      ]);
    } else if (editingDiscountId) {
      setExtraDiscounts(extraDiscounts.map(discount => 
        discount.id === editingDiscountId
          ? { ...discount, value, description: tempDiscountDescription }
          : discount
      ));
    }
    
    setEditingDiscountId(null);
  };

  const handleEditDiscount = (discount: ExtraDiscount) => {
    setEditingDiscountId(discount.id);
    setTempDiscountValue(discount.value.toString());
    setTempDiscountDescription(discount.description);
  };

  const handleDeleteDiscount = (id: string) => {
    setExtraDiscounts(extraDiscounts.filter(d => d.id !== id));
  };

  const handleCancelEditing = () => {
    setEditingDiscountId(null);
    setTempDiscountValue("0");
    setTempDiscountDescription("");
  };

  const calculateTotalDiscounts = () => {
    return extraDiscounts.reduce((total, discount) => total + discount.value, 0);
  };

  const calcularResultadoFinal = (valorLiquido: number) => {
    const totalInvestimentosConsiderado = mostrarInvestimentos ? calcularTotalInvestimentos() : 0;
    return valorLiquido - totalInvestimentosConsiderado - calculateTotalDiscounts();
  };

  const mesesDisponiveis = () => {
    const meses = [];
    const dataAtual = new Date();
    
    for (let i = 0; i < 12; i++) {
      const data = new Date(dataAtual);
      data.setMonth(dataAtual.getMonth() - i);
      
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
      
      meses.push({
        valor: `${ano}-${mes}`,
        texto: `${nomeMes} de ${ano}`
      });
    }
    
    return meses;
  };

  const calcularTotaisSetoristas = () => {
    let totais = {
      vendas: 0,
      comissao: 0,
      comissaoRetida: 0,
      premios: 0,
      despesas: 0,
      valorLiquido: 0
    };
    
    resumoSetoristas.forEach(setorista => {
      totais.vendas += setorista.vendas;
      totais.comissao += setorista.comissao;
      totais.comissaoRetida += setorista.comissaoRetida;
      totais.premios += setorista.premios;
      totais.despesas += setorista.despesas;
      totais.valorLiquido += setorista.valorLiquido;
    });
    
    return totais;
  };

  const calcularTotaisDiarios = () => {
    let totais = {
      vendas: 0,
      comissao: 0,
      comissaoRetida: 0,
      premios: 0,
      despesas: 0,
      valorLiquido: 0
    };
    
    resumoDiario.forEach(dia => {
      totais.vendas += dia.vendas;
      totais.comissao += dia.comissao;
      totais.comissaoRetida += dia.comissaoRetida;
      totais.premios += dia.premios;
      totais.despesas += dia.despesas;
      totais.valorLiquido += dia.valorLiquido;
    });
    
    return totais;
  };

  const calcularTotalInvestimentos = () => {
    return investimentos.reduce((total, investimento) => total + investimento.valor, 0);
  };

  const renderDiscountsSection = () => (
    <div className="space-y-4">
      {extraDiscounts.map((discount) => (
        editingDiscountId === discount.id ? (
          <div key={discount.id} className="space-y-4 mt-2 mb-2 border p-4 rounded-lg">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`valor-desconto-${discount.id}`}>Valor</Label>
              <Input
                id={`valor-desconto-${discount.id}`}
                className="w-full"
                value={tempDiscountValue}
                onChange={(e) => setTempDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`descricao-desconto-${discount.id}`}>Descrição</Label>
              <Textarea
                id={`descricao-desconto-${discount.id}`}
                className="resize-none"
                placeholder="Informe o motivo do desconto extra"
                value={tempDiscountDescription}
                onChange={(e) => setTempDiscountDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleCancelEditing}>
                <XIcon className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveDiscount}>
                <SaveIcon className="h-4 w-4 mr-1" /> Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div key={discount.id} className="flex justify-between items-start border-b pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">(-) Desconto Extra:</span>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditDiscount(discount)}
                  className="h-6 w-6"
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteDiscount(discount.id)}
                  className="h-6 w-6 text-destructive"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
              {discount.description && (
                <p className="text-sm text-muted-foreground ml-4">{discount.description}</p>
              )}
            </div>
            <span className="font-bold text-destructive shrink-0">
              -{formatCurrency(discount.value)}
            </span>
          </div>
        )
      ))}

      {editingDiscountId === 'new' ? (
        <div className="space-y-4 mt-2 mb-2 border p-4 rounded-lg">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="valor-desconto-novo">Valor</Label>
            <Input
              id="valor-desconto-novo"
              className="w-full"
              value={tempDiscountValue}
              onChange={(e) => setTempDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))}
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="descricao-desconto-novo">Descrição</Label>
            <Textarea
              id="descricao-desconto-novo"
              className="resize-none"
              placeholder="Informe o motivo do desconto extra"
              value={tempDiscountDescription}
              onChange={(e) => setTempDiscountDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleCancelEditing}>
              <XIcon className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveDiscount}>
              <SaveIcon className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddNewDiscount}
          className="w-full mt-2"
        >
          + Adicionar Desconto Extra
        </Button>
      )}

      <div className="pt-2 border-t flex justify-between items-center">
        <span className="font-bold">RESULTADO FINAL:</span>
        <span className="font-bold text-xl" style={{ 
          color: calcularResultadoFinal(totaisSetoristas.valorLiquido) >= 0 ? 'var(--success)' : 'var(--destructive)' 
        }}>
          {formatCurrency(calcularResultadoFinal(totaisSetoristas.valorLiquido))}
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const listaSetoristas = await getSetoristas();
        setSetoristas(listaSetoristas);
        
        await atualizarDados(filtroMes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    carregarDados();
  }, [filtroMes]);
  
  const atualizarDados = async (mesAno: string) => {
    try {
      const [ano, mes] = mesAno.split('-').map(Number);
      
      const todosMovimentos = await getMovimentos();
      const todasDespesas = await getDespesas();
      const todosInvestimentos = await getInvestimentos();
      
      const movimentosFiltrados = todosMovimentos.filter(movimento => {
        const dataMovimento = new Date(movimento.data);
        return dataMovimento.getMonth() + 1 === mes && dataMovimento.getFullYear() === ano;
      });
      
      const despesasFiltradas = todasDespesas.filter(despesa => {
        const dataDespesa = new Date(despesa.data);
        return dataDespesa.getMonth() + 1 === mes && dataDespesa.getFullYear() === ano;
      });
      
      const investimentosFiltrados = todosInvestimentos.filter(investimento => {
        const dataInvestimento = new Date(investimento.data);
        return dataInvestimento.getMonth() + 1 === mes && dataInvestimento.getFullYear() === ano;
      });
    
    setMovimentos(movimentosFiltrados);
    setDespesas(despesasFiltradas);
    setInvestimentos(investimentosFiltrados);
    
    const resumoSetorista: Record<string, {
      id: string;
      nome: string;
      vendas: number;
      comissao: number;
      comissaoRetida: number;
      premios: number;
      despesas: number;
      valorLiquido: number;
    }> = {};
    
    setoristas.forEach(setorista => {
      resumoSetorista[setorista.id] = {
        id: setorista.id,
        nome: setorista.nome,
        vendas: 0,
        comissao: 0,
        comissaoRetida: 0,
        premios: 0,
        despesas: 0,
        valorLiquido: 0
      };
    });
    
    movimentosFiltrados.forEach(movimento => {
      if (!resumoSetorista[movimento.setoristaId]) return;
      
      resumoSetorista[movimento.setoristaId].vendas += movimento.vendas || 0;
      resumoSetorista[movimento.setoristaId].comissao += movimento.comissao || 0;
      resumoSetorista[movimento.setoristaId].comissaoRetida += movimento.comissaoRetida || 0;
      resumoSetorista[movimento.setoristaId].premios += movimento.premios || 0;
      resumoSetorista[movimento.setoristaId].valorLiquido += movimento.valorLiquido || 0;
    });
    
    despesasFiltradas.forEach(despesa => {
      if (!resumoSetorista[despesa.setoristaId]) return;
      resumoSetorista[despesa.setoristaId].despesas += despesa.valor || 0;
      resumoSetorista[despesa.setoristaId].valorLiquido -= despesa.valor || 0;
    });
    
    setResumoSetoristas(Object.values(resumoSetorista));
    
    const resumoPorDia: Record<string, {
      data: string;
      vendas: number;
      comissao: number;
      comissaoRetida: number;
      premios: number;
      despesas: number;
      valorLiquido: number;
    }> = {};
    
    movimentosFiltrados.forEach(movimento => {
      const dataKey = format(new Date(movimento.data), 'dd/MM');
      
      if (!resumoPorDia[dataKey]) {
        resumoPorDia[dataKey] = {
          data: dataKey,
          vendas: 0,
          comissao: 0,
          comissaoRetida: 0,
          premios: 0,
          despesas: 0,
          valorLiquido: 0
        };
      }
      
      resumoPorDia[dataKey].vendas += movimento.vendas || 0;
      resumoPorDia[dataKey].comissao += movimento.comissao || 0;
      resumoPorDia[dataKey].comissaoRetida += movimento.comissaoRetida || 0;
      resumoPorDia[dataKey].premios += movimento.premios || 0;
      resumoPorDia[dataKey].valorLiquido += movimento.valorLiquido || 0;
    });
    
    despesasFiltradas.forEach(despesa => {
      const dataKey = format(new Date(despesa.data), 'dd/MM');
      
      if (!resumoPorDia[dataKey]) {
        resumoPorDia[dataKey] = {
          data: dataKey,
          vendas: 0,
          comissao: 0,
          comissaoRetida: 0,
          premios: 0,
          despesas: 0,
          valorLiquido: 0
        };
      }
      
      resumoPorDia[dataKey].despesas += despesa.valor || 0;
      resumoPorDia[dataKey].valorLiquido -= despesa.valor || 0;
    });
    
    const resumoDiarioArray = Object.values(resumoPorDia);
    resumoDiarioArray.sort((a, b) => {
      const [diaA, mesA] = a.data.split('/').map(Number);
      const [diaB, mesB] = b.data.split('/').map(Number);
      
      if (mesA !== mesB) return mesA - mesB;
      return diaA - diaB;
    });
    
    setResumoDiario(resumoDiarioArray);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const totaisSetoristas = calcularTotaisSetoristas();
  const totaisDiarios = calcularTotaisDiarios();
  const totalInvestimentos = calcularTotalInvestimentos();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos movimentos financeiros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printHandler}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="default" onClick={printHandler}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </div>
      </header>
      
      <div className="bg-card border rounded-lg p-6" ref={printRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold">Resultados Financeiros</h2>
          
          <div className="w-full sm:w-auto">
            <SimpleSelect
              value={filtroMes}
              onValueChange={(valor) => setFiltroMes(valor)}
              placeholder="Selecione um mês"
              className="w-full sm:w-[240px]"
            >
              {mesesDisponiveis().map(mes => (
                <SimpleSelectItem key={mes.valor} value={mes.valor}>
                  {mes.texto}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="setoristas">Por Setorista</TabsTrigger>
            <TabsTrigger value="diario">Por Dia</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setoristas">
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  Resumo de movimentos financeiros por setorista
                </TableCaption>
                
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Setorista</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Comissão Retida</TableHead>
                    <TableHead className="text-right">Prêmios</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {resumoSetoristas.length > 0 ? (
                    resumoSetoristas.map(setorista => (
                      <TableRow key={setorista.id}>
                        <TableCell className="font-medium">{setorista.nome}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.vendas)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.comissao)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.comissaoRetida)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.premios)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.despesas)}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ 
                          color: setorista.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                        }}>
                          {formatCurrency(setorista.valorLiquido)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Nenhum movimento encontrado para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAIS</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisSetoristas.vendas)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisSetoristas.comissao)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisSetoristas.comissaoRetida)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisSetoristas.premios)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisSetoristas.despesas)}</TableCell>
                    <TableCell className="text-right font-bold" style={{ 
                      color: totaisSetoristas.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                    }}>
                      {formatCurrency(totaisSetoristas.valorLiquido)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <Card className="mt-6 bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resumo Final</span>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="mostrar-investimentos" 
                      checked={mostrarInvestimentos}
                      onCheckedChange={(checked) => setMostrarInvestimentos(!!checked)}
                    />
                    <label htmlFor="mostrar-investimentos" className="text-sm cursor-pointer">
                      Incluir Investimentos
                    </label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Valor Líquido:</span>
                    <span className="font-bold" style={{ 
                      color: totaisSetoristas.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                    }}>
                      {formatCurrency(totaisSetoristas.valorLiquido)}
                    </span>
                  </div>
                  
                  {mostrarInvestimentos && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">(-) Investimentos:</span>
                      <span className="font-bold text-destructive">
                        -{formatCurrency(totalInvestimentos)}
                      </span>
                    </div>
                  )}
                  
                  {renderDiscountsSection()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diario">
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  Resumo de movimentos financeiros por dia
                </TableCaption>
                
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Data</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Comissão Retida</TableHead>
                    <TableHead className="text-right">Prêmios</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {resumoDiario.length > 0 ? (
                    resumoDiario.map((dia, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dia.data}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.vendas)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.comissao)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.comissaoRetida)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.premios)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.despesas)}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ 
                          color: dia.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                        }}>
                          {formatCurrency(dia.valorLiquido)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Nenhum movimento encontrado para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAIS</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisDiarios.vendas)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisDiarios.comissao)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisDiarios.comissaoRetida)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisDiarios.premios)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totaisDiarios.despesas)}</TableCell>
                    <TableCell className="text-right font-bold" style={{ 
                      color: totaisDiarios.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                    }}>
                      {formatCurrency(totaisDiarios.valorLiquido)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <Card className="mt-6 bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resumo Final</span>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="mostrar-investimentos-diario" 
                      checked={mostrarInvestimentos}
                      onCheckedChange={(checked) => setMostrarInvestimentos(!!checked)}
                    />
                    <label htmlFor="mostrar-investimentos-diario" className="text-sm cursor-pointer">
                      Incluir Investimentos
                    </label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Valor Líquido:</span>
                    <span className="font-bold" style={{ 
                      color: totaisDiarios.valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                    }}>
                      {formatCurrency(totaisDiarios.valorLiquido)}
                    </span>
                  </div>
                  
                  {mostrarInvestimentos && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">(-) Investimentos:</span>
                      <span className="font-bold text-destructive">
                        -{formatCurrency(totalInvestimentos)}
                      </span>
                    </div>
                  )}
                  
                  {renderDiscountsSection()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
