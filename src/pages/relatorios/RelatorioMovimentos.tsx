import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { 
  getMovimentos, 
  getSetoristas
} from '@/services/storageService';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

const RelatorioMovimentos = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoFinanceiro[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);

  const handlePrint = () => {
    // Verificar se há filtros aplicados
    const temFiltros = dataInicial || dataFinal || (setoristaId && setoristaId !== 'all');
    
    // Determinar período para exibição
    let periodo = 'Todos os movimentos';
    if (dataInicial && dataFinal) {
      const dataIni = new Date(dataInicial).toLocaleDateString('pt-BR');
      const dataFim = new Date(dataFinal).toLocaleDateString('pt-BR');
      periodo = dataIni === dataFim ? dataIni : `${dataIni} a ${dataFim}`;
    } else if (dataInicial) {
      periodo = `A partir de ${new Date(dataInicial).toLocaleDateString('pt-BR')}`;
    } else if (dataFinal) {
      periodo = `Até ${new Date(dataFinal).toLocaleDateString('pt-BR')}`;
    }

    // CSS para impressão
    const styles = `
      <style>
        @media print {
          * { margin: 0 !important; padding: 0 !important; }
          body { 
            margin: 0 !important; 
            padding: 8px !important; 
            font-weight: 600; 
            -webkit-print-color-adjust: exact;
          }
          .header { 
            margin: 0 0 10px 0 !important; 
            padding: 0 0 6px 0 !important; 
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            height: auto !important;
          }
          .header h1 { 
            font-size: 22px !important; 
            margin: 0 0 6px 0 !important; 
            padding: 0 !important;
          }
          .header .period { 
            font-size: 13px !important; 
            margin: 3px 0 !important; 
            padding: 0 !important;
          }
          .header .date { 
            font-size: 11px !important; 
            margin: 3px 0 !important; 
            padding: 0 !important;
          }
          .section { 
            margin: 0 0 8px 0 !important; 
            padding: 0 !important; 
            page-break-inside: avoid !important;
          }
          .section h2 { 
            font-size: 16px !important; 
            margin: 0 0 4px 0 !important; 
            padding: 0 !important;
          }
          .filters { 
            font-size: 11px !important; 
            margin: 0 0 4px 0 !important; 
            padding: 0 !important;
          }
          .data-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin: 0 !important; 
            font-size: 11px !important;
          }
          .data-table th, .data-table td { 
            border: 1px solid #000 !important; 
            padding: 3px 4px !important; 
            text-align: left !important;
          }
          .data-table th { 
            background-color: #f0f0f0 !important; 
            font-weight: bold !important;
          }
          .data-table .text-right { 
            text-align: right !important;
          }
          .total-row { 
            background-color: #f0f0f0 !important; 
            font-weight: bold !important;
          }
          .no-data { 
            font-style: italic !important; 
            text-align: center !important;
          }
        }
      </style>
    `;

    // Obter dados para o PDF
    const totais = calcularTotais();
    
    // Formatar período se houver filtros de data
    const periodoTexto = dataInicial && dataFinal 
      ? `Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`
      : 'Todos os movimentos';

    // Formatar filtros ativos
    const filtrosAtivos = [];
    if (setoristaId && setoristaId !== 'all') {
      const setorista = setoristas.find(s => s.id === setoristaId);
      if (setorista) filtrosAtivos.push(`Setorista: ${setorista.nome}`);
    }

    // Gerar tabela de movimentos
    const tabelaMovimentos = movimentosFiltrados.length > 0 ? `
      <div class="section ${!temFiltros ? 'no-filters' : ''}">
        <h2>Lista de Movimentos Financeiros</h2>
        ${temFiltros && filtrosAtivos.length > 0 ? `<p class="filters">Filtros aplicados: ${filtrosAtivos.join(' | ')}</p>` : ''}
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Setorista</th>
              <th class="text-right">Vendas</th>
              <th class="text-right">Comissão</th>
              <th class="text-right">Comissão Retida</th>
              <th class="text-right">Prêmios</th>
              <th class="text-right">Despesas</th>
              <th class="text-right">Valor Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${movimentosFiltrados.map(movimento => `
              <tr>
                <td>${formatDate(movimento.data)}</td>
                <td>${movimento.setorista?.nome || 'N/A'}</td>
                <td class="text-right">${formatCurrency(movimento.vendas)}</td>
                <td class="text-right">${formatCurrency(movimento.comissao)}</td>
                <td class="text-right">${formatCurrency(movimento.comissaoRetida)}</td>
                <td class="text-right">${formatCurrency(movimento.premios)}</td>
                <td class="text-right">${formatCurrency(movimento.despesas)}</td>
                <td class="text-right">${formatCurrency(movimento.valorLiquido)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.vendas)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.comissao)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.comissaoRetida)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.premios)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.despesas)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totais.valorLiquido)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum movimento encontrado com os filtros aplicados.</p></div>';

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Erro: Não foi possível abrir nova janela');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Movimentos Financeiros</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Movimentos Financeiros</h1>
            <div class="period">${periodoTexto}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          ${tabelaMovimentos}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Filtros de data (padrão: mês atual)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const toInput = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return { ini: toInput(first), fim: toInput(last) };
  };

  const currentRange = getCurrentMonthRange();
  const [dataInicial, setDataInicial] = useState(currentRange.ini);
  const [dataFinal, setDataFinal] = useState(currentRange.fim);
  const [setoristaId, setSetoristaId] = useState<string>('all');

  useEffect(() => {
    carregarMovimentos();
    getSetoristas().then(setSetoristas).catch(() => {});
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [movimentos, dataInicial, dataFinal, setoristaId]);

  const carregarMovimentos = async () => {
    try {
      const lista = await getMovimentos();
      setMovimentos(lista);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      toast.error('Erro ao carregar movimentos');
    }
  };

  const aplicarFiltros = () => {
    const ini = new Date(dataInicial + 'T00:00:00');
    const fim = new Date(dataFinal + 'T23:59:59');
    
    const filtrada = movimentos.filter(movimento => {
      const d = new Date(movimento.data);
      const inRange = d >= ini && d <= fim;
      const matchSetorista = setoristaId === 'all' || movimento.setoristaId === setoristaId;
      return inRange && matchSetorista;
    });

    // Ordenar por data (mais recente primeiro)
    filtrada.sort((a, b) => b.data.getTime() - a.data.getTime());
    setMovimentosFiltrados(filtrada);
  };

  const calcularTotais = () => {
    return movimentosFiltrados.reduce((acc, movimento) => ({
      vendas: acc.vendas + movimento.vendas,
      comissao: acc.comissao + movimento.comissao,
      comissaoRetida: acc.comissaoRetida + movimento.comissaoRetida,
      premios: acc.premios + movimento.premios,
      despesas: acc.despesas + movimento.despesas,
      valorLiquido: acc.valorLiquido + movimento.valorLiquido
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

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Relatório de Movimentos Financeiros</h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatório de movimentos financeiros
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Input
                id="dataInicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFinal">Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="setorista">Setorista</Label>
              <SimpleSelect value={setoristaId} onValueChange={setSetoristaId}>
                <SimpleSelectItem value="all">Todos os setoristas</SimpleSelectItem>
                {setoristas.map((setorista) => (
                  <SimpleSelectItem key={setorista.id} value={setorista.id}>
                    {setorista.nome}
                  </SimpleSelectItem>
                ))}
              </SimpleSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total de Movimentos</p>
              <p className="text-2xl font-bold">{movimentosFiltrados.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.vendas)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Líquido</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totais.valorLiquido)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="text-sm">
                {new Date(dataInicial).toLocaleDateString('pt-BR')} a {new Date(dataFinal).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentos Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          {movimentosFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Setorista</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">Comissão Retida</TableHead>
                  <TableHead className="text-right">Prêmios</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Valor Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentosFiltrados.map((movimento) => (
                  <TableRow key={movimento.id}>
                    <TableCell className="font-medium">
                      {formatDate(movimento.data)}
                    </TableCell>
                    <TableCell>
                      {movimento.setorista?.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.vendas)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.comissao)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.comissaoRetida)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.premios)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.despesas)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movimento.valorLiquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.vendas)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.comissao)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.comissaoRetida)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.premios)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.despesas)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totais.valorLiquido)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum movimento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioMovimentos;
