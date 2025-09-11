import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { Calculator, Filter, X, TrendingUp, Target, Printer } from "lucide-react";
import { toast } from "sonner";
import { getSetoristas, getMovimentos, getDespesas } from '@/services/storageService';
import { Setorista, MovimentoFinanceiro, Despesa } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface DadosReais {
  vendas: number;
  premios: number;
  comissao: number;
  despesas: number;
  liquido: number;
}

interface PercentuaisIdeal {
  premios: number;
  comissao: number;
  liquido: number;
  despesas: number;
}

interface ProjecaoIdeal {
  premios: number;
  comissao: number;
  liquido: number;
  despesas: number;
}

const ProjecaoPage = () => {
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  
  // Dados calculados
  const [dadosReais, setDadosReais] = useState<DadosReais>({
    vendas: 0,
    premios: 0,
    comissao: 0,
    despesas: 0,
    liquido: 0
  });
  
  // Percentuais ideais (configuráveis pelo gestor)
  const [percentuaisIdeal, setPercentuaisIdeal] = useState<PercentuaisIdeal>({
    premios: 50,
    comissao: 20,
    liquido: 20,
    despesas: 10
  });
  
  const [projecaoIdeal, setProjecaoIdeal] = useState<ProjecaoIdeal>({
    premios: 0,
    comissao: 0,
    liquido: 0,
    despesas: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaMovimentos = await getMovimentos();
      const listaDespesas = await getDespesas();
      
      // Ordenar por data (mais antigo primeiro)
      listaMovimentos.sort((a, b) => a.data.getTime() - b.data.getTime());
      listaDespesas.sort((a, b) => a.data.getTime() - b.data.getTime());
      
      setMovimentos(listaMovimentos);
      setDespesas(listaDespesas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    // Filtrar movimentações
    let movimentosFiltrados = [...movimentos];
    let despesasFiltradas = [...despesas];

    // Aplicar filtros de data
    if (dataInicial) {
      const dataIni = new Date(dataInicial + 'T00:00:00');
      movimentosFiltrados = movimentosFiltrados.filter(item => {
        const dataCompara = new Date(item.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara >= dataIni;
      });
      despesasFiltradas = despesasFiltradas.filter(item => {
        const dataCompara = new Date(item.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara >= dataIni;
      });
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal + 'T23:59:59');
      movimentosFiltrados = movimentosFiltrados.filter(item => {
        const dataCompara = new Date(item.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara <= dataFim;
      });
      despesasFiltradas = despesasFiltradas.filter(item => {
        const dataCompara = new Date(item.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara <= dataFim;
      });
    }

    // Aplicar filtro de setorista
    if (setoristaId && setoristaId !== 'all') {
      movimentosFiltrados = movimentosFiltrados.filter(item => item.setoristaId === setoristaId);
      despesasFiltradas = despesasFiltradas.filter(item => item.setoristaId === setoristaId);
    }

    return { movimentos: movimentosFiltrados, despesas: despesasFiltradas };
  };

  const calcularDadosReais = () => {
    const { movimentos: movimentosFiltrados, despesas: despesasFiltradas } = aplicarFiltros();
    
    // Calcular totais das movimentações
    const totaisMovimentos = movimentosFiltrados.reduce((totais, movimento) => ({
      vendas: totais.vendas + movimento.vendas,
      comissao: totais.comissao + movimento.comissao,
      comissaoRetida: totais.comissaoRetida + movimento.comissaoRetida,
      premios: totais.premios + movimento.premios,
      despesas: totais.despesas + movimento.despesas,
      valorLiquido: totais.valorLiquido + movimento.valorLiquido
    }), {
      vendas: 0,
      comissao: 0,
      comissaoRetida: 0,
      premios: 0,
      despesas: 0,
      valorLiquido: 0
    });

    // Calcular total das despesas
    const totalDespesas = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);

    const dados: DadosReais = {
      vendas: totaisMovimentos.vendas,
      premios: totaisMovimentos.premios,
      comissao: totaisMovimentos.comissao + totaisMovimentos.comissaoRetida,
      despesas: totaisMovimentos.despesas + totalDespesas,
      liquido: totaisMovimentos.valorLiquido - totalDespesas
    };

    setDadosReais(dados);
    return dados;
  };

  const calcularProjecaoIdeal = (vendas: number) => {
    const projecao: ProjecaoIdeal = {
      premios: (vendas * percentuaisIdeal.premios) / 100,
      comissao: (vendas * percentuaisIdeal.comissao) / 100,
      liquido: (vendas * percentuaisIdeal.liquido) / 100,
      despesas: (vendas * percentuaisIdeal.despesas) / 100
    };

    setProjecaoIdeal(projecao);
    return projecao;
  };

  const gerarProjecao = () => {
    if (!dataInicial || !dataFinal) {
      toast.error('Por favor, selecione o período');
      return;
    }

    const dados = calcularDadosReais();
    calcularProjecaoIdeal(dados.vendas);
    
    toast.success('Projeção gerada com sucesso!');
  };

  const handlePrint = () => {
    if (dadosReais.vendas === 0) {
      toast.error('Gere uma projeção antes de imprimir');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Projeção Financeira</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; color: #000; }
            
            .header { 
              text-align: center; 
              margin-bottom: 25px; 
              padding: 15px 0; 
              border-bottom: 3px solid #000; 
              background: #f8f9fa;
            }
            .header h1 { font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #1f2937; }
            .header .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
            .header .info { font-size: 11px; color: #9ca3af; }
            
            .summary-section {
              background: #f3f4f6;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 6px;
              border: 1px solid #d1d5db;
            }
            .summary-title { 
              font-size: 14px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #374151;
              text-align: center;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 15px; 
              text-align: center;
            }
            .summary-item { 
              background: white; 
              padding: 8px; 
              border-radius: 4px; 
              border: 1px solid #e5e7eb;
            }
            .summary-item .label { 
              font-size: 10px; 
              color: #6b7280; 
              margin-bottom: 4px;
              font-weight: 500;
            }
            .summary-item .value { 
              font-size: 13px; 
              font-weight: bold; 
              color: #1f2937;
            }
            
            .comparison-section {
              margin-bottom: 25px;
            }
            .comparison-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 15px;
              padding: 8px 12px;
              background: #e5e7eb;
              border-left: 4px solid #3b82f6;
              color: #1f2937;
            }
            
            .data-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 20px; 
            }
            .data-card {
              background: #f9fafb;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 12px;
            }
            .data-card h3 {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 10px;
              padding: 6px 8px;
              background: #e5e7eb;
              border-radius: 4px;
              text-align: center;
            }
            .data-item { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding: 6px 8px; 
              margin-bottom: 4px; 
              background: white; 
              border-radius: 4px;
              border: 1px solid #f3f4f6;
            }
            .data-item .label { 
              font-weight: 600; 
              font-size: 11px;
              color: #374151;
            }
            .data-item .value { 
              text-align: right; 
            }
            .data-item .main-value { 
              font-weight: bold; 
              font-size: 11px;
            }
            .data-item .percentage { 
              font-size: 9px; 
              color: #6b7280; 
              margin-top: 2px;
            }
            
            .table-section {
              margin-top: 25px;
            }
            .table-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 12px;
              padding: 8px 12px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              color: #92400e;
            }
            
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 10px;
            }
            .table th, .table td { 
              border: 1px solid #374151; 
              padding: 8px 6px; 
              text-align: left; 
            }
            .table th { 
              background: #374151; 
              color: white;
              font-weight: bold; 
              text-align: center; 
              font-size: 10px;
            }
            .table td { 
              text-align: right; 
              vertical-align: top;
            }
            .table td:first-child { 
              text-align: left; 
              font-weight: 600;
              background: #f9fafb;
            }
            .table .value-cell {
              padding: 4px 6px;
            }
            .table .value-cell .main-value {
              font-weight: bold;
              font-size: 10px;
            }
            .table .value-cell .percentage {
              font-size: 8px;
              color: #6b7280;
              margin-top: 2px;
            }
            
            .positive { color: #059669; font-weight: bold; }
            .negative { color: #dc2626; font-weight: bold; }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              font-size: 9px;
              color: #6b7280;
            }
            
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 PROJEÇÃO FINANCEIRA</h1>
            <div class="subtitle">Análise de Performance e Projeção Ideal</div>
            <div class="info">
              <strong>Período:</strong> ${dataInicial ? formatDate(new Date(dataInicial)) : 'Início'} até ${dataFinal ? formatDate(new Date(dataFinal)) : 'Fim'} | 
              <strong>Setorista:</strong> ${setoristaId === 'all' ? 'Todos' : setoristas.find(s => s.id === setoristaId)?.nome || 'N/A'} | 
              <strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-title">🎯 CONFIGURAÇÃO DE PERCENTUAIS IDEAIS</div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Prêmios</div>
                <div class="value">${percentuaisIdeal.premios}%</div>
              </div>
              <div class="summary-item">
                <div class="label">Comissão</div>
                <div class="value">${percentuaisIdeal.comissao}%</div>
              </div>
              <div class="summary-item">
                <div class="label">Líquido</div>
                <div class="value">${percentuaisIdeal.liquido}%</div>
              </div>
              <div class="summary-item">
                <div class="label">Despesas</div>
                <div class="value">${percentuaisIdeal.despesas}%</div>
              </div>
            </div>
          </div>

          <div class="comparison-section">
            <div class="comparison-title">📈 COMPARAÇÃO: DADOS REAIS vs PROJEÇÃO IDEAL</div>
            <div class="data-grid">
              <div class="data-card">
                <h3>📊 DADOS REAIS</h3>
                <div class="data-item">
                  <span class="label">Vendas:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(dadosReais.vendas)}</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Prêmios:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(dadosReais.premios)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.premios / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Comissão:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(dadosReais.comissao)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.comissao / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Despesas:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(dadosReais.despesas)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.despesas / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Líquido:</span>
                  <div class="value">
                    <div class="main-value ${dadosReais.liquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(dadosReais.liquido)}</div>
                    <div class="percentage ${dadosReais.liquido >= 0 ? 'positive' : 'negative'}">${dadosReais.vendas > 0 ? ((dadosReais.liquido / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
              </div>

              <div class="data-card">
                <h3>🎯 PROJEÇÃO IDEAL</h3>
                <div class="data-item">
                  <span class="label">Vendas:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(dadosReais.vendas)}</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Prêmios:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(projecaoIdeal.premios)}</div>
                    <div class="percentage">${percentuaisIdeal.premios}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Comissão:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(projecaoIdeal.comissao)}</div>
                    <div class="percentage">${percentuaisIdeal.comissao}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Despesas:</span>
                  <div class="value">
                    <div class="main-value">${formatCurrency(projecaoIdeal.despesas)}</div>
                    <div class="percentage">${percentuaisIdeal.despesas}%</div>
                  </div>
                </div>
                <div class="data-item">
                  <span class="label">Líquido:</span>
                  <div class="value">
                    <div class="main-value positive">${formatCurrency(projecaoIdeal.liquido)}</div>
                    <div class="percentage">${percentuaisIdeal.liquido}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-section">
            <div class="table-title">📋 ANÁLISE DETALHADA DE DIFERENÇAS</div>
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 15%;">Item</th>
                  <th style="width: 25%;">Real (R$ / %)</th>
                  <th style="width: 25%;">Ideal (R$ / %)</th>
                  <th style="width: 17.5%;">Diferença (R$)</th>
                  <th style="width: 17.5%;">Diferença (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Prêmios</strong></td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(dadosReais.premios)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.premios / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(projecaoIdeal.premios)}</div>
                    <div class="percentage">${percentuaisIdeal.premios}%</div>
                  </td>
                  <td class="${calcularDiferenca(dadosReais.premios, projecaoIdeal.premios) >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(calcularDiferenca(dadosReais.premios, projecaoIdeal.premios))}
                  </td>
                  <td class="${calcularPercentualDiferenca(dadosReais.premios, projecaoIdeal.premios) >= 0 ? 'positive' : 'negative'}">
                    ${calcularPercentualDiferenca(dadosReais.premios, projecaoIdeal.premios).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td><strong>Comissão</strong></td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(dadosReais.comissao)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.comissao / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(projecaoIdeal.comissao)}</div>
                    <div class="percentage">${percentuaisIdeal.comissao}%</div>
                  </td>
                  <td class="${calcularDiferenca(dadosReais.comissao, projecaoIdeal.comissao) >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(calcularDiferenca(dadosReais.comissao, projecaoIdeal.comissao))}
                  </td>
                  <td class="${calcularPercentualDiferenca(dadosReais.comissao, projecaoIdeal.comissao) >= 0 ? 'positive' : 'negative'}">
                    ${calcularPercentualDiferenca(dadosReais.comissao, projecaoIdeal.comissao).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td><strong>Despesas</strong></td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(dadosReais.despesas)}</div>
                    <div class="percentage">${dadosReais.vendas > 0 ? ((dadosReais.despesas / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </td>
                  <td class="value-cell">
                    <div class="main-value">${formatCurrency(projecaoIdeal.despesas)}</div>
                    <div class="percentage">${percentuaisIdeal.despesas}%</div>
                  </td>
                  <td class="${calcularDiferenca(dadosReais.despesas, projecaoIdeal.despesas) > 0 ? 'negative' : 'positive'}">
                    ${formatCurrency(calcularDiferenca(dadosReais.despesas, projecaoIdeal.despesas))}
                  </td>
                  <td class="${calcularPercentualDiferenca(dadosReais.despesas, projecaoIdeal.despesas) > 0 ? 'negative' : 'positive'}">
                    ${calcularPercentualDiferenca(dadosReais.despesas, projecaoIdeal.despesas).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td><strong>Líquido</strong></td>
                  <td class="value-cell">
                    <div class="main-value ${dadosReais.liquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(dadosReais.liquido)}</div>
                    <div class="percentage ${dadosReais.liquido >= 0 ? 'positive' : 'negative'}">${dadosReais.vendas > 0 ? ((dadosReais.liquido / dadosReais.vendas) * 100).toFixed(1) : 0}%</div>
                  </td>
                  <td class="value-cell">
                    <div class="main-value positive">${formatCurrency(projecaoIdeal.liquido)}</div>
                    <div class="percentage">${percentuaisIdeal.liquido}%</div>
                  </td>
                  <td class="${calcularDiferenca(dadosReais.liquido, projecaoIdeal.liquido) >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(calcularDiferenca(dadosReais.liquido, projecaoIdeal.liquido))}
                  </td>
                  <td class="${calcularPercentualDiferenca(dadosReais.liquido, projecaoIdeal.liquido) >= 0 ? 'positive' : 'negative'}">
                    ${calcularPercentualDiferenca(dadosReais.liquido, projecaoIdeal.liquido).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p><strong>Sorte Ouro Verde</strong> - Sistema de Gestão Financeira | Relatório gerado automaticamente</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
    setDadosReais({
      vendas: 0,
      premios: 0,
      comissao: 0,
      despesas: 0,
      liquido: 0
    });
    setProjecaoIdeal({
      premios: 0,
      comissao: 0,
      liquido: 0,
      despesas: 0
    });
  };

  const atualizarPercentual = (campo: keyof PercentuaisIdeal, valor: number) => {
    const novosPercentuais = { ...percentuaisIdeal, [campo]: valor };
    
    // Calcular o percentual de despesas automaticamente
    const totalDefinido = novosPercentuais.premios + novosPercentuais.comissao + novosPercentuais.liquido;
    novosPercentuais.despesas = Math.max(0, 100 - totalDefinido);
    
    setPercentuaisIdeal(novosPercentuais);
    
    // Recalcular projeção se já tiver dados
    if (dadosReais.vendas > 0) {
      calcularProjecaoIdeal(dadosReais.vendas);
    }
  };

  const calcularDiferenca = (real: number, ideal: number) => {
    return real - ideal;
  };

  const calcularPercentualDiferenca = (real: number, ideal: number) => {
    if (ideal === 0) return 0;
    return ((real - ideal) / ideal) * 100;
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Calculator className="mr-2 h-8 w-8" />
              Projeção
            </h1>
            <p className="text-muted-foreground">
              Análise de performance e projeção ideal
            </p>
          </div>
          <Button 
            onClick={handlePrint} 
            className="mt-4 sm:mt-0"
            variant="outline"
            disabled={dadosReais.vendas === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Filtros */}
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
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={gerarProjecao} className="flex-1">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Gerar Projeção
                </Button>
                <Button variant="outline" onClick={limparFiltros}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Percentuais Ideais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Configuração de Percentuais Ideais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual-premios">Prêmios (%)</Label>
              <Input
                id="percentual-premios"
                type="number"
                min="0"
                max="100"
                value={percentuaisIdeal.premios}
                onChange={(e) => atualizarPercentual('premios', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentual-comissao">Comissão (%)</Label>
              <Input
                id="percentual-comissao"
                type="number"
                min="0"
                max="100"
                value={percentuaisIdeal.comissao}
                onChange={(e) => atualizarPercentual('comissao', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentual-liquido">Líquido (%)</Label>
              <Input
                id="percentual-liquido"
                type="number"
                min="0"
                max="100"
                value={percentuaisIdeal.liquido}
                onChange={(e) => atualizarPercentual('liquido', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentual-despesas">Despesas (%)</Label>
              <Input
                id="percentual-despesas"
                type="number"
                value={percentuaisIdeal.despesas}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Calculado automaticamente</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total:</strong> {percentuaisIdeal.premios + percentuaisIdeal.comissao + percentuaisIdeal.liquido + percentuaisIdeal.despesas}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas de Comparação */}
      {dadosReais.vendas > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Reais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">Dados Reais</CardTitle>
              <p className="text-sm text-gray-600">
                Período: {dataInicial ? formatDate(new Date(dataInicial)) : 'Início'} até {dataFinal ? formatDate(new Date(dataFinal)) : 'Fim'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Vendas:</span>
                  <span className="font-bold text-lg">{formatCurrency(dadosReais.vendas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Prêmios:</span>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(dadosReais.premios)}</div>
                    <div className="text-sm text-gray-600">
                      {dadosReais.vendas > 0 ? ((dadosReais.premios / dadosReais.vendas) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Comissão:</span>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(dadosReais.comissao)}</div>
                    <div className="text-sm text-gray-600">
                      {dadosReais.vendas > 0 ? ((dadosReais.comissao / dadosReais.vendas) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Despesas:</span>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(dadosReais.despesas)}</div>
                    <div className="text-sm text-gray-600">
                      {dadosReais.vendas > 0 ? ((dadosReais.despesas / dadosReais.vendas) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Líquido:</span>
                  <div className="text-right">
                    <div className={`font-bold ${dadosReais.liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dadosReais.liquido)}
                    </div>
                    <div className={`text-sm ${dadosReais.liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dadosReais.vendas > 0 ? ((dadosReais.liquido / dadosReais.vendas) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projeção Ideal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">Projeção Ideal</CardTitle>
              <p className="text-sm text-gray-600">
                Baseado em {formatCurrency(dadosReais.vendas)} de vendas
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Vendas:</span>
                  <span className="font-bold text-lg">{formatCurrency(dadosReais.vendas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Prêmios ({percentuaisIdeal.premios}%):</span>
                  <span className="font-bold">{formatCurrency(projecaoIdeal.premios)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Comissão ({percentuaisIdeal.comissao}%):</span>
                  <span className="font-bold">{formatCurrency(projecaoIdeal.comissao)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Despesas ({percentuaisIdeal.despesas}%):</span>
                  <span className="font-bold">{formatCurrency(projecaoIdeal.despesas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Líquido ({percentuaisIdeal.liquido}%):</span>
                  <span className="font-bold text-green-600">{formatCurrency(projecaoIdeal.liquido)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise de Diferenças */}
      {dadosReais.vendas > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-orange-600">Análise de Diferenças</CardTitle>
            <p className="text-sm text-gray-600">
              Comparação entre dados reais e projeção ideal
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Real (R$ / %)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Ideal (R$ / %)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Diferença (R$)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Diferença (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Prêmios</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(dadosReais.premios)}</div>
                      <div className="text-sm text-gray-600">
                        {dadosReais.vendas > 0 ? ((dadosReais.premios / dadosReais.vendas) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(projecaoIdeal.premios)}</div>
                      <div className="text-sm text-gray-600">{percentuaisIdeal.premios}%</div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularDiferenca(dadosReais.premios, projecaoIdeal.premios) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calcularDiferenca(dadosReais.premios, projecaoIdeal.premios))}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularPercentualDiferenca(dadosReais.premios, projecaoIdeal.premios) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calcularPercentualDiferenca(dadosReais.premios, projecaoIdeal.premios).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Comissão</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(dadosReais.comissao)}</div>
                      <div className="text-sm text-gray-600">
                        {dadosReais.vendas > 0 ? ((dadosReais.comissao / dadosReais.vendas) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(projecaoIdeal.comissao)}</div>
                      <div className="text-sm text-gray-600">{percentuaisIdeal.comissao}%</div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularDiferenca(dadosReais.comissao, projecaoIdeal.comissao) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calcularDiferenca(dadosReais.comissao, projecaoIdeal.comissao))}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularPercentualDiferenca(dadosReais.comissao, projecaoIdeal.comissao) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calcularPercentualDiferenca(dadosReais.comissao, projecaoIdeal.comissao).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Despesas</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(dadosReais.despesas)}</div>
                      <div className="text-sm text-gray-600">
                        {dadosReais.vendas > 0 ? ((dadosReais.despesas / dadosReais.vendas) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div>{formatCurrency(projecaoIdeal.despesas)}</div>
                      <div className="text-sm text-gray-600">{percentuaisIdeal.despesas}%</div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularDiferenca(dadosReais.despesas, projecaoIdeal.despesas) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(calcularDiferenca(dadosReais.despesas, projecaoIdeal.despesas))}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularPercentualDiferenca(dadosReais.despesas, projecaoIdeal.despesas) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {calcularPercentualDiferenca(dadosReais.despesas, projecaoIdeal.despesas).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Líquido</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div className={dadosReais.liquido >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(dadosReais.liquido)}
                      </div>
                      <div className={`text-sm ${dadosReais.liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dadosReais.vendas > 0 ? ((dadosReais.liquido / dadosReais.vendas) * 100).toFixed(1) : 0}%
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <div className="text-green-600">{formatCurrency(projecaoIdeal.liquido)}</div>
                      <div className="text-sm text-gray-600">{percentuaisIdeal.liquido}%</div>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularDiferenca(dadosReais.liquido, projecaoIdeal.liquido) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calcularDiferenca(dadosReais.liquido, projecaoIdeal.liquido))}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                      calcularPercentualDiferenca(dadosReais.liquido, projecaoIdeal.liquido) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calcularPercentualDiferenca(dadosReais.liquido, projecaoIdeal.liquido).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjecaoPage;
