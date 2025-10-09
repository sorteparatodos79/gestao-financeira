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
  getInvestimentos, 
  getSetoristas
} from '@/services/storageService';
import { Investimento, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

const RelatorioInvestimentos = () => {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [investimentosFiltrados, setInvestimentosFiltrados] = useState<Investimento[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);

  const handlePrint = () => {
    // Verificar se há filtros aplicados
    const temFiltros = dataInicial || dataFinal || (setoristaId && setoristaId !== 'all') || (tipoInvestimento && tipoInvestimento !== 'all');
    
    // Determinar período para exibição
    let periodo = 'Todos os investimentos';
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
    const total = calcularTotal();
    
    // Formatar período se houver filtros de data
    const periodoTexto = dataInicial && dataFinal 
      ? `Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`
      : 'Todos os investimentos';

    // Formatar filtros ativos
    const filtrosAtivos = [];
    if (setoristaId && setoristaId !== 'all') {
      const setorista = setoristas.find(s => s.id === setoristaId);
      if (setorista) filtrosAtivos.push(`Setorista: ${setorista.nome}`);
    }
    if (tipoInvestimento && tipoInvestimento !== 'all') {
      filtrosAtivos.push(`Tipo: ${tipoInvestimento}`);
    }

    // Gerar tabela de investimentos
    const tabelaInvestimentos = investimentosFiltrados.length > 0 ? `
      <div class="section ${!temFiltros ? 'no-filters' : ''}">
        <h2>Lista de Investimentos</h2>
        ${temFiltros && filtrosAtivos.length > 0 ? `<p class="filters">Filtros aplicados: ${filtrosAtivos.join(' | ')}</p>` : ''}
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Setorista</th>
              <th>Tipo</th>
              <th class="text-right">Valor</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${investimentosFiltrados.map(investimento => `
              <tr>
                <td>${formatDate(investimento.data)}</td>
                <td>${investimento.setorista?.nome || 'N/A'}</td>
                <td>${investimento.tipoInvestimento}</td>
                <td class="text-right">${formatCurrency(investimento.valor)}</td>
                <td>${investimento.descricao || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"><strong>TOTAL</strong></td>
              <td class="text-right"><strong>${formatCurrency(total)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum investimento encontrado com os filtros aplicados.</p></div>';

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
          <title>Relatório de Investimentos</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Investimentos</h1>
            <div class="period">${periodoTexto}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          ${tabelaInvestimentos}
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
  const [tipoInvestimento, setTipoInvestimento] = useState<string>('all');

  useEffect(() => {
    carregarInvestimentos();
    getSetoristas().then(setSetoristas).catch(() => {});
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [investimentos, dataInicial, dataFinal, setoristaId, tipoInvestimento]);

  const carregarInvestimentos = async () => {
    try {
      const lista = await getInvestimentos();
      setInvestimentos(lista);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      toast.error('Erro ao carregar investimentos');
    }
  };

  const aplicarFiltros = () => {
    const ini = new Date(dataInicial + 'T00:00:00');
    const fim = new Date(dataFinal + 'T23:59:59');
    
    const filtrada = investimentos.filter(investimento => {
      const d = new Date(investimento.data);
      const inRange = d >= ini && d <= fim;
      const matchSetorista = setoristaId === 'all' || investimento.setoristaId === setoristaId;
      const matchTipo = tipoInvestimento === 'all' || investimento.tipoInvestimento === tipoInvestimento;
      return inRange && matchSetorista && matchTipo;
    });

    // Ordenar por data (mais recente primeiro)
    filtrada.sort((a, b) => b.data.getTime() - a.data.getTime());
    setInvestimentosFiltrados(filtrada);
  };

  const calcularTotal = () => {
    return investimentosFiltrados.reduce((acc, investimento) => acc + investimento.valor, 0);
  };

  const tiposInvestimento = [
    'Aquisição de Vendedores', 'Equipamento', 'Publicidade', 
    'Desenvolvimento de Software', 'Treinamento', 'Infraestrutura', 'Outros'
  ];

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Relatório de Investimentos</h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatório de investimentos
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <Label htmlFor="tipoInvestimento">Tipo de Investimento</Label>
              <SimpleSelect value={tipoInvestimento} onValueChange={setTipoInvestimento}>
                <SimpleSelectItem value="all">Todos os tipos</SimpleSelectItem>
                {tiposInvestimento.map((tipo) => (
                  <SimpleSelectItem key={tipo} value={tipo}>
                    {tipo}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total de Investimentos</p>
              <p className="text-2xl font-bold">{investimentosFiltrados.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(calcularTotal())}</p>
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
          <CardTitle>Lista de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {investimentosFiltrados.length > 0 ? (
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
                {investimentosFiltrados.map((investimento) => (
                  <TableRow key={investimento.id}>
                    <TableCell className="font-medium">
                      {formatDate(investimento.data)}
                    </TableCell>
                    <TableCell>
                      {investimento.setorista?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>{investimento.tipoInvestimento}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(investimento.valor)}
                    </TableCell>
                    <TableCell>
                      {investimento.descricao || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(calcularTotal())}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum investimento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioInvestimentos;
