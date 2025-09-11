
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { FileText, Download, Filter, X, Printer } from "lucide-react";
import { toast } from "sonner";
import { getSetoristas, getMovimentos, getDespesas, getInvestimentos } from '@/services/storageService';
import { Setorista, MovimentoFinanceiro, Despesa, Investimento } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';

const RelatoriosPage = () => {
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaMovimentos = await getMovimentos();
      const listaDespesas = await getDespesas();
      const listaInvestimentos = await getInvestimentos();
      
      // Ordenar por data (mais antigo primeiro)
      listaMovimentos.sort((a, b) => a.data.getTime() - b.data.getTime());
      listaDespesas.sort((a, b) => a.data.getTime() - b.data.getTime());
      listaInvestimentos.sort((a, b) => a.data.getTime() - b.data.getTime());
      
      setMovimentos(listaMovimentos);
      setDespesas(listaDespesas);
      setInvestimentos(listaInvestimentos);
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

    // Agrupar por data
    const dadosPorData: { [key: string]: any } = {};

    // Processar movimentações
    movimentosFiltrados.forEach(movimento => {
      const dataKey = movimento.data.toISOString().split('T')[0];
      if (!dadosPorData[dataKey]) {
        dadosPorData[dataKey] = {
          data: movimento.data,
          vendas: 0,
          comissao: 0,
          comissaoRetida: 0,
          premios: 0,
          despesas: 0,
          valorLiquido: 0
        };
      }
      dadosPorData[dataKey].vendas += movimento.vendas;
      dadosPorData[dataKey].comissao += movimento.comissao;
      dadosPorData[dataKey].comissaoRetida += movimento.comissaoRetida;
      dadosPorData[dataKey].premios += movimento.premios;
      dadosPorData[dataKey].despesas += movimento.despesas;
      dadosPorData[dataKey].valorLiquido += movimento.valorLiquido;
    });

    // Processar despesas
    despesasFiltradas.forEach(despesa => {
      const dataKey = despesa.data.toISOString().split('T')[0];
      if (!dadosPorData[dataKey]) {
        dadosPorData[dataKey] = {
          data: despesa.data,
          vendas: 0,
          comissao: 0,
          comissaoRetida: 0,
          premios: 0,
          despesas: 0,
          valorLiquido: 0
        };
      }
      dadosPorData[dataKey].despesas += despesa.valor;
      dadosPorData[dataKey].valorLiquido -= despesa.valor;
    });

    // Converter para array e ordenar por data
    const dadosAgrupados = Object.values(dadosPorData).sort((a: any, b: any) => 
      a.data.getTime() - b.data.getTime()
    );

    return dadosAgrupados;
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
  };

  const dadosFiltrados = aplicarFiltros();

  const calcularTotais = () => {
    return dadosFiltrados.reduce((totais, item: any) => ({
      vendas: totais.vendas + (item.vendas || 0),
      comissao: totais.comissao + (item.comissao || 0),
      comissaoRetida: totais.comissaoRetida + (item.comissaoRetida || 0),
      premios: totais.premios + (item.premios || 0),
      despesas: totais.despesas + (item.despesas || 0),
      valorLiquido: totais.valorLiquido + (item.valorLiquido || 0)
    }), {
      vendas: 0,
      comissao: 0,
      comissaoRetida: 0,
      premios: 0,
      despesas: 0,
      valorLiquido: 0
    });
  };

  const totais = calcularTotais();

  const handleExportar = () => {
    toast.success('Exportando relatório completo para PDF...');
    // Aqui seria implementada a lógica de exportação real
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; }
            .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
            .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .filters { margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
            .filters h3 { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
            .filters p { margin: 2px 0; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; text-align: center; }
            td { text-align: right; }
            td:first-child { text-align: left; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Financeiro - Movimentações e Despesas</h1>
            <p>Período: ${dataInicial ? formatDate(new Date(dataInicial)) : 'Início'} até ${dataFinal ? formatDate(new Date(dataFinal)) : 'Fim'}</p>
            <p>Setorista: ${setoristaId === 'all' ? 'Todos' : setoristas.find(s => s.id === setoristaId)?.nome || 'N/A'}</p>
            <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="filters">
            <h3>Filtros Aplicados:</h3>
            <p><strong>Período:</strong> ${dataInicial ? formatDate(new Date(dataInicial)) : 'Início'} até ${dataFinal ? formatDate(new Date(dataFinal)) : 'Fim'}</p>
            <p><strong>Setorista:</strong> ${setoristaId === 'all' ? 'Todos' : setoristas.find(s => s.id === setoristaId)?.nome || 'N/A'}</p>
            <p><strong>Total de Registros:</strong> ${dadosFiltrados.length} dias</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Vendas</th>
                <th>Comissão</th>
                <th>Prêmios</th>
                <th>Despesas</th>
                <th>Líquido</th>
              </tr>
            </thead>
            <tbody>
              ${dadosFiltrados.map((item: any) => `
                <tr>
                  <td>${formatDate(item.data)}</td>
                  <td>${formatCurrency(item.vendas)}</td>
                  <td>${formatCurrency(item.comissao + item.comissaoRetida)}</td>
                  <td>${formatCurrency(item.premios)}</td>
                  <td>${formatCurrency(item.despesas)}</td>
                  <td class="${item.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(item.valorLiquido)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>TOTAL</td>
                <td>${formatCurrency(totais.vendas)}</td>
                <td>${formatCurrency(totais.comissao + totais.comissaoRetida)}</td>
                <td>${formatCurrency(totais.premios)}</td>
                <td>${formatCurrency(totais.despesas)}</td>
                <td class="${totais.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(totais.valorLiquido)}</td>
              </tr>
            </tfoot>
          </table>
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

  const renderTabela = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Vendas</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Comissão</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Prêmios</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Despesas</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Líquido</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item: any, index: number) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{formatDate(item.data)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.vendas)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.comissao + item.comissaoRetida)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.premios)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                  {formatCurrency(item.despesas)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-medium" style={{ color: item.valorLiquido >= 0 ? '#16a34a' : '#dc2626' }}>
                  {formatCurrency(item.valorLiquido)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 px-4 py-2">TOTAL</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totais.vendas)}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totais.comissao + totais.comissaoRetida)}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totais.premios)}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totais.despesas)}</td>
              <td className="border border-gray-300 px-4 py-2 text-right" style={{ color: totais.valorLiquido >= 0 ? '#16a34a' : '#dc2626' }}>
                {formatCurrency(totais.valorLiquido)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-2 h-8 w-8" />
              Relatórios
            </h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios do sistema
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button 
              onClick={handlePrint} 
              variant="outline"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button 
              onClick={handleExportar} 
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Relatório Financeiro - Movimentações e Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {dadosFiltrados.length > 0 ? (
            renderTabela()
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosPage;
