
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
  getInvestimentos,
  getDescontosExtrasByMesAno,
  addDescontoExtra,
  updateDescontoExtra,
  deleteDescontoExtra
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

const Index = () => {
  const isMobile = useIsMobile();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [mostrarInvestimentos, setMostrarInvestimentos] = useState<boolean>(true);
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

  const handleGeneratePDF = () => {
    if (!printRef.current) {
      toast.error('Erro ao gerar PDF: elemento não encontrado');
      return;
    }

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Erro: Não foi possível abrir nova janela');
      return;
    }

    // Obter dados para o PDF
    const totaisSetoristas = calcularTotaisSetoristas();
    const totaisDiarios = calcularTotaisDiarios();
    const totalInvestimentos = calcularTotalInvestimentos();
    const totalDescontos = calculateTotalDiscounts();
    const porcentagensSetoristas = calcularPorcentagens(totaisSetoristas);
    const porcentagensDiarios = calcularPorcentagens(totaisDiarios);

    // Determinar dados baseado na aba ativa
    const isSetoristas = activeTab === 'setoristas';
    const totaisAtivos = isSetoristas ? totaisSetoristas : totaisDiarios;
    const resultadoFinal = calcularResultadoFinal(totaisAtivos.valorLiquido);
    const porcentagensAtivas = isSetoristas ? porcentagensSetoristas : porcentagensDiarios;

    // Formatar data do período
    const [ano, mes] = filtroMes.split('-');
    const nomeMes = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleString('pt-BR', { month: 'long' });
    const periodoFormatado = `${nomeMes} de ${ano}`;

    // Gerar conteúdo da tabela baseado na aba ativa
    const tabelaAtiva = isSetoristas ? 
      (resumoSetoristas.length > 0 ? `
      <div class="section">
        <h2>Resumo por Setorista</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Setorista</th>
              <th class="text-right">Vendas</th>
              <th class="text-right">Comissão</th>
              <th class="text-right">Prêmios</th>
              <th class="text-right">Despesas</th>
              <th class="text-right">Valor Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${resumoSetoristas.map(setorista => `
              <tr>
                <td>${setorista.nome}</td>
                <td class="text-right">${formatCurrency(setorista.vendas)}</td>
                <td class="text-right">${formatCurrency(setorista.comissao + setorista.comissaoRetida)}</td>
                <td class="text-right">${formatCurrency(setorista.premios)}</td>
                <td class="text-right">${formatCurrency(setorista.despesas)}</td>
                <td class="text-right ${setorista.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(setorista.valorLiquido)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>TOTAIS</strong></td>
              <td class="text-right">
                <strong>${formatCurrency(totaisSetoristas.vendas)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensSetoristas.vendas}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisSetoristas.comissao + totaisSetoristas.comissaoRetida)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${((totaisSetoristas.comissao + totaisSetoristas.comissaoRetida) / totaisSetoristas.vendas * 100).toFixed(1)}%</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisSetoristas.premios)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensSetoristas.premios}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisSetoristas.despesas)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensSetoristas.despesas}</div>
              </td>
              <td class="text-right ${totaisSetoristas.valorLiquido >= 0 ? 'positive' : 'negative'}">
                <strong>${formatCurrency(totaisSetoristas.valorLiquido)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensSetoristas.valorLiquido}</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum movimento encontrado para o período selecionado.</p></div>')
    :
    (resumoDiario.length > 0 ? `
      <div class="section">
        <h2>Resumo por Dia</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th class="text-right">Vendas</th>
              <th class="text-right">Comissão</th>
              <th class="text-right">Prêmios</th>
              <th class="text-right">Despesas</th>
              <th class="text-right">Valor Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${resumoDiario.map(dia => `
              <tr>
                <td>${dia.data}</td>
                <td class="text-right">${formatCurrency(dia.vendas)}</td>
                <td class="text-right">${formatCurrency(dia.comissao + dia.comissaoRetida)}</td>
                <td class="text-right">${formatCurrency(dia.premios)}</td>
                <td class="text-right">${formatCurrency(dia.despesas)}</td>
                <td class="text-right ${dia.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(dia.valorLiquido)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>TOTAIS</strong></td>
              <td class="text-right">
                <strong>${formatCurrency(totaisDiarios.vendas)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensDiarios.vendas}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisDiarios.comissao + totaisDiarios.comissaoRetida)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${((totaisDiarios.comissao + totaisDiarios.comissaoRetida) / totaisDiarios.vendas * 100).toFixed(1)}%</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisDiarios.premios)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensDiarios.premios}</div>
              </td>
              <td class="text-right">
                <strong>${formatCurrency(totaisDiarios.despesas)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensDiarios.despesas}</div>
              </td>
              <td class="text-right ${totaisDiarios.valorLiquido >= 0 ? 'positive' : 'negative'}">
                <strong>${formatCurrency(totaisDiarios.valorLiquido)}</strong>
                <div style="font-size: 10px; font-weight: normal; color: #9ca3af;">${porcentagensDiarios.valorLiquido}</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum movimento encontrado para o período selecionado.</p></div>');

    // Adicionar estilos CSS otimizados para PDF
    const styles = `
      <style>
        * { box-sizing: border-box; }
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #000;
          font-weight: 500;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        
        .header h1 {
          font-size: 28px;
          margin: 0 0 10px 0;
          color: #1e40af;
          font-weight: 700;
        }
        
        .header .period {
          font-size: 16px;
          color: #6b7280;
          margin: 5px 0;
        }
        
        .header .date {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          font-size: 18px;
          color: #000;
          margin: 0 0 15px 0;
          padding: 10px 0;
          border-bottom: 2px solid #000;
          font-weight: 700;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        
        .data-table th {
          background-color: #f8fafc;
          color: #000;
          font-weight: 700;
          padding: 8px 6px;
          text-align: left;
          border: 1px solid #000;
          font-size: 11px;
        }
        
        .data-table td {
          padding: 6px;
          border: 1px solid #000;
          vertical-align: top;
          font-weight: 500;
          color: #000;
        }
        
        .data-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .data-table tbody tr:hover {
          background-color: #f3f4f6;
        }
        
        .total-row {
          background-color: #000 !important;
          color: white !important;
          font-weight: 700;
        }
        
        .total-row td {
          border-color: #000 !important;
          font-weight: 700;
        }
        
        .text-right { text-align: right; }
        .positive { color: #059669; font-weight: 700; }
        .negative { color: #dc2626; font-weight: 700; }
        
        .summary {
          background-color: #f8fafc;
          border: 2px solid #000;
          border-radius: 6px;
          padding: 12px;
          margin-top: 15px;
        }
        
        .summary h3 {
          font-size: 14px;
          color: #000;
          margin: 0 0 8px 0;
          font-weight: 700;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        
        .summary-row:last-child {
          border-bottom: none;
          font-weight: 700;
          font-size: 13px;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 2px solid #d1d5db;
        }
        
        .summary-label {
          font-weight: 600;
          color: #000;
          font-size: 12px;
        }
        
        .summary-value {
          font-weight: 700;
          color: #000;
          font-size: 12px;
        }
        
        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px;
          background-color: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
        }
        
        @media print {
          body { margin: 0; padding: 15px; font-weight: 600; }
          .section { page-break-inside: avoid; }
          .data-table { font-size: 11px; font-weight: 600; }
          .data-table th, .data-table td { padding: 4px; font-weight: 600; }
          .data-table th { font-weight: 700; }
          .total-row { font-weight: 700; }
          .summary { padding: 8px; margin-top: 10px; }
          .summary h3 { font-size: 12px; margin-bottom: 6px; }
          .summary-row { padding: 2px 0; font-size: 11px; }
          .summary-row:last-child { font-size: 12px; padding-top: 4px; margin-top: 2px; }
          .summary-label, .summary-value { font-size: 11px; }
        }
      </style>
    `;

    // Montar o HTML completo e organizado
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dashboard Financeiro - ${isSetoristas ? 'Por Setorista' : 'Por Dia'} - ${periodoFormatado}</title>
          <meta charset="utf-8">
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Dashboard Financeiro</h1>
            <div class="period">Período: ${periodoFormatado}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>

          ${tabelaAtiva}

          <div class="summary">
            <h3>Resumo Final</h3>
            <div class="summary-row">
              <span class="summary-label">Valor Líquido:</span>
              <span class="summary-value ${totaisAtivos.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(totaisAtivos.valorLiquido)}</span>
            </div>${mostrarInvestimentos ? `<div class="summary-row"><span class="summary-label">(-) Investimentos:</span><span class="summary-value negative">-${formatCurrency(totalInvestimentos)}</span></div>` : ''}${extraDiscounts.map(discount => `<div class="summary-row"><span class="summary-label">(-) ${discount.description || 'Desconto Extra'}:</span><span class="summary-value negative">-${formatCurrency(discount.value)}</span></div>`).join('')}<div class="summary-row">
              <span class="summary-label">RESULTADO FINAL:</span>
              <span class="summary-value ${resultadoFinal >= 0 ? 'positive' : 'negative'}">${formatCurrency(resultadoFinal)}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // Escrever o conteúdo na nova janela
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Aguardar o carregamento e imprimir automaticamente
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        toast.success('PDF gerado e baixado com sucesso!');
      }, 500);
    };
  };

  const handleAddNewDiscount = () => {
    setEditingDiscountId('new');
    setTempDiscountValue("0");
    setTempDiscountDescription("");
  };

  const handleSaveDiscount = async () => {
    const value = Number(tempDiscountValue) || 0;
    
    try {
      if (editingDiscountId === 'new') {
        // Criar novo desconto no banco
        const novoDesconto = await addDescontoExtra({
          mesAno: filtroMes,
          value,
          description: tempDiscountDescription
        });
        
        setExtraDiscounts([...extraDiscounts, novoDesconto]);
        toast.success('Desconto extra adicionado com sucesso!');
      } else if (editingDiscountId) {
        // Atualizar desconto existente no banco
        const descontoExistente = extraDiscounts.find(d => d.id === editingDiscountId);
        if (descontoExistente) {
          const descontoAtualizado = await updateDescontoExtra({
            ...descontoExistente,
            value,
            description: tempDiscountDescription
          });
          
          setExtraDiscounts(extraDiscounts.map(discount => 
            discount.id === editingDiscountId ? descontoAtualizado : discount
          ));
          toast.success('Desconto extra atualizado com sucesso!');
        }
      }
      
      setEditingDiscountId(null);
    } catch (error) {
      console.error('Erro ao salvar desconto:', error);
      toast.error('Erro ao salvar desconto extra');
    }
  };

  const handleEditDiscount = (discount: ExtraDiscount) => {
    setEditingDiscountId(discount.id);
    setTempDiscountValue(discount.value.toString());
    setTempDiscountDescription(discount.description);
  };

  const handleDeleteDiscount = async (id: string) => {
    try {
      await deleteDescontoExtra(id);
      setExtraDiscounts(extraDiscounts.filter(d => d.id !== id));
      toast.success('Desconto extra removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar desconto:', error);
      toast.error('Erro ao remover desconto extra');
    }
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

  const calcularPorcentagens = (totais: any) => {
    const totalVendas = totais.vendas;
    if (totalVendas === 0) {
      return {
        vendas: "0%",
        comissao: "0%", 
        comissaoRetida: "0%",
        premios: "0%",
        despesas: "0%",
        valorLiquido: "0%"
      };
    }

    return {
      vendas: "100%", // Total de vendas é sempre 100%
      comissao: `${((totais.comissao / totalVendas) * 100).toFixed(1)}%`,
      comissaoRetida: `${((totais.comissaoRetida / totalVendas) * 100).toFixed(1)}%`,
      premios: `${((totais.premios / totalVendas) * 100).toFixed(1)}%`,
      despesas: `${((totais.despesas / totalVendas) * 100).toFixed(1)}%`,
      valorLiquido: `${((totais.valorLiquido / totalVendas) * 100).toFixed(1)}%`
    };
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
          color: calcularResultadoFinal(totaisSetoristas.valorLiquido) >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
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
        
        // Carregar descontos extras para o mês atual
        const descontosExtras = await getDescontosExtrasByMesAno(filtroMes);
        setExtraDiscounts(descontosExtras);
        
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
      const listaSetoristas = await getSetoristas();
      
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
    
    listaSetoristas.forEach(setorista => {
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
          <Button variant="default" onClick={handleGeneratePDF}>
            <PrinterIcon className="mr-2 h-4 w-4" />
            Imprimir
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
                        <TableCell className="text-right">{formatCurrency(setorista.comissao + setorista.comissaoRetida)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.premios)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(setorista.despesas)}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ 
                          color: setorista.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
                        }}>
                          {formatCurrency(setorista.valorLiquido)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Nenhum movimento encontrado para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAIS</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisSetoristas.vendas)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisSetoristas).vendas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisSetoristas.comissao + totaisSetoristas.comissaoRetida)}</span>
                        <span className="text-xs text-muted-foreground">{((totaisSetoristas.comissao + totaisSetoristas.comissaoRetida) / totaisSetoristas.vendas * 100).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisSetoristas.premios)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisSetoristas).premios}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisSetoristas.despesas)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisSetoristas).despesas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold" style={{ 
                      color: totaisSetoristas.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
                    }}>
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisSetoristas.valorLiquido)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisSetoristas).valorLiquido}</span>
                      </div>
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
                      color: totaisSetoristas.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
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
                        <TableCell className="text-right">{formatCurrency(dia.comissao + dia.comissaoRetida)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.premios)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(dia.despesas)}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ 
                          color: dia.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
                        }}>
                          {formatCurrency(dia.valorLiquido)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Nenhum movimento encontrado para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAIS</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisDiarios.vendas)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisDiarios).vendas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisDiarios.comissao + totaisDiarios.comissaoRetida)}</span>
                        <span className="text-xs text-muted-foreground">{((totaisDiarios.comissao + totaisDiarios.comissaoRetida) / totaisDiarios.vendas * 100).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisDiarios.premios)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisDiarios).premios}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisDiarios.despesas)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisDiarios).despesas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold" style={{ 
                      color: totaisDiarios.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
                    }}>
                      <div className="flex flex-col">
                        <span>{formatCurrency(totaisDiarios.valorLiquido)}</span>
                        <span className="text-xs text-muted-foreground">{calcularPorcentagens(totaisDiarios).valorLiquido}</span>
                      </div>
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
                      color: totaisDiarios.valorLiquido >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' 
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
