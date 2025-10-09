import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getVales, deleteVale, getSetoristas } from '@/services/storageService';
import { Vale, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Printer, Receipt } from 'lucide-react';

const ValesList = () => {
  const [vales, setVales] = useState<Vale[]>([]);
  const [valesFiltrados, setValesFiltrados] = useState<Vale[]>([]);
  const [loading, setLoading] = useState(true);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [valeParaExcluir, setValeParaExcluir] = useState<Vale | null>(null);

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
    carregarVales();
    getSetoristas().then(setSetoristas).catch(() => {});
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [vales, dataInicial, dataFinal, setoristaId]);

  const carregarVales = async () => {
    try {
      setLoading(true);
      const lista = await getVales();
      setVales(lista);
    } catch (error) {
      console.error('Erro ao carregar vales:', error);
      toast.error('Erro ao carregar vales');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const ini = new Date(dataInicial + 'T00:00:00');
    const fim = new Date(dataFinal + 'T23:59:59');
    
    const filtrada = vales.filter(vale => {
      const d = new Date(vale.data);
      const inRange = d >= ini && d <= fim;
      const matchSetorista = setoristaId === 'all' || vale.setoristaId === setoristaId;
      return inRange && matchSetorista;
    });

    // Ordenar por data (mais recente primeiro)
    filtrada.sort((a, b) => b.data.getTime() - a.data.getTime());
    setValesFiltrados(filtrada);
  };

  // Calcular saldo de vales por setorista
  const calcularSaldoPorSetorista = () => {
    const saldoPorSetorista = new Map<string, {
      setorista: Setorista;
      totalPendente: number;
      totalRecebido: number;
      saldoLiquido: number;
      quantidadeVales: number;
    }>();

    vales.forEach(vale => {
      if (!saldoPorSetorista.has(vale.setoristaId)) {
        const setorista = setoristas.find(s => s.id === vale.setoristaId);
        if (setorista) {
          saldoPorSetorista.set(vale.setoristaId, {
            setorista,
            totalPendente: 0,
            totalRecebido: 0,
            saldoLiquido: 0,
            quantidadeVales: 0
          });
        }
      }

      const saldo = saldoPorSetorista.get(vale.setoristaId);
      if (saldo) {
        saldo.quantidadeVales++;
        
        if (vale.recebido) {
          saldo.totalRecebido += vale.valor;
          // Recebido diminui o saldo (foi pago)
          saldo.saldoLiquido -= vale.valor;
        } else {
          saldo.totalPendente += vale.valor;
          saldo.saldoLiquido += vale.valor; // Pendente aumenta o saldo
        }
      }
    });

    return Array.from(saldoPorSetorista.values()).sort((a, b) => b.saldoLiquido - a.saldoLiquido);
  };

  const saldoPorSetorista = calcularSaldoPorSetorista();

  const handleDelete = (vale: Vale) => {
    setValeParaExcluir(vale);
  };

  const confirmarExclusao = async () => {
    if (valeParaExcluir) {
      try {
        await deleteVale(valeParaExcluir.id);
        await carregarVales();
        toast.success('Vale excluído com sucesso!');
        setValeParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir vale:', error);
        toast.error('Erro ao excluir vale');
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Erro: Não foi possível abrir nova janela');
      return;
    }

    const total = valesFiltrados.reduce((acc, vale) => acc + vale.valor, 0);
    
    // Formatar período
    const periodoTexto = dataInicial && dataFinal 
      ? `Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`
      : 'Todos os vales';

    // Formatar filtros ativos
    const filtrosAtivos = [];
    if (setoristaId && setoristaId !== 'all') {
      const setorista = setoristas.find(s => s.id === setoristaId);
      if (setorista) filtrosAtivos.push(`Setorista: ${setorista.nome}`);
    }
    
    const temFiltros = dataInicial || dataFinal || (setoristaId && setoristaId !== 'all');

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
          .setorista-section {
            margin: 0 0 15px 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
          }
          .setorista-title {
            font-size: 14px !important;
            font-weight: bold !important;
            margin: 0 0 5px 0 !important;
            padding: 0 !important;
            background-color: #e0e0e0 !important;
            padding: 3px 5px !important;
          }
        }
      </style>
    `;

    // Resumo de saldo por setorista para impressão
    const resumoSaldo = saldoPorSetorista.length > 0 ? `
      <div class="section">
        <h2>Resumo de Saldo por Setorista</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Setorista</th>
              <th class="text-right">Pendente</th>
              <th class="text-right">Recebido</th>
              <th class="text-right">Saldo Atual</th>
            </tr>
          </thead>
          <tbody>
            ${saldoPorSetorista.map(saldo => `
              <tr>
                <td>${saldo.setorista.nome}</td>
                <td class="text-right">${formatCurrency(saldo.totalPendente)}</td>
                <td class="text-right">${formatCurrency(saldo.totalRecebido)}</td>
                <td class="text-right ${saldo.saldoLiquido > 0 ? 'text-red' : 'text-green'}">
                  <strong>${formatCurrency(saldo.saldoLiquido)}</strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>TOTAL GERAL</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.totalPendente, 0))}</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.totalRecebido, 0))}</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.saldoLiquido, 0))}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '';

    // Lista de vales agrupada por setorista
    const valesPorSetorista = valesFiltrados.reduce((acc, vale) => {
      const setoristaNome = vale.setorista?.nome || 'N/A';
      if (!acc[setoristaNome]) {
        acc[setoristaNome] = [];
      }
      acc[setoristaNome].push(vale);
      return acc;
    }, {} as Record<string, Vale[]>);

    const listaValesPorSetorista = Object.keys(valesPorSetorista).length > 0 ? `
      <div class="section">
        <h2>Lista de Vales por Setorista</h2>
        ${Object.entries(valesPorSetorista).map(([setoristaNome, valesSetorista]) => `
          <div class="setorista-section">
            <div class="setorista-title">${setoristaNome}</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th class="text-right">Valor</th>
                  <th>Status</th>
                  <th>Data Recebimento</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${valesSetorista.map(vale => `
                  <tr>
                    <td>${formatDate(vale.data)}</td>
                    <td class="text-right">${formatCurrency(vale.valor)}</td>
                    <td>${vale.recebido ? 'Recebido' : 'Pendente'}</td>
                    <td>${vale.dataRecebimento ? formatDate(vale.dataRecebimento) : '—'}</td>
                    <td>${vale.descricao || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td><strong>Subtotal ${setoristaNome}</strong></td>
                  <td class="text-right"><strong>${formatCurrency(valesSetorista.reduce((acc, v) => acc + v.valor, 0))}</strong></td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        `).join('')}
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum vale encontrado com os filtros aplicados.</p></div>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Vales</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Vales</h1>
            <div class="period">${periodoTexto}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          ${resumoSaldo}
          ${listaValesPorSetorista}
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

  const handlePrintIndividual = (setorista: Setorista) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Erro: Não foi possível abrir nova janela');
      return;
    }

    // Filtrar vales do setorista específico
    const valesSetorista = valesFiltrados.filter(vale => vale.setoristaId === setorista.id);
    const saldoSetorista = saldoPorSetorista.find(s => s.setorista.id === setorista.id);

    if (!saldoSetorista) {
      toast.error('Nenhum vale encontrado para este setorista');
      return;
    }

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
          .resumo-box {
            border: 2px solid #000 !important;
            padding: 8px !important;
            margin: 0 0 10px 0 !important;
            background-color: #f9f9f9 !important;
          }
        }
      </style>
    `;

    // Resumo individual do setorista
    const resumoIndividual = `
      <div class="section">
        <h2>Resumo - ${setorista.nome}</h2>
        <div class="resumo-box">
          <table class="data-table">
            <tr>
              <td><strong>Total Pendente:</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoSetorista.totalPendente)}</strong></td>
            </tr>
            <tr>
              <td><strong>Total Recebido:</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoSetorista.totalRecebido)}</strong></td>
            </tr>
            <tr>
              <td><strong>Saldo Atual:</strong></td>
              <td class="text-right"><strong>${formatCurrency(saldoSetorista.saldoLiquido)}</strong></td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td class="text-right"><strong>${saldoSetorista.saldoLiquido > 0 ? 'Devendo à empresa' : 'Em dia'}</strong></td>
            </tr>
          </table>
        </div>
      </div>
    `;

    // Lista de vales do setorista
    const listaValesIndividual = valesSetorista.length > 0 ? `
      <div class="section">
        <h2>Lista de Vales - ${setorista.nome}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th class="text-right">Valor</th>
              <th>Status</th>
              <th>Data Recebimento</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${valesSetorista.map(vale => `
              <tr>
                <td>${formatDate(vale.data)}</td>
                <td class="text-right">${formatCurrency(vale.valor)}</td>
                <td>${vale.recebido ? 'Recebido' : 'Pendente'}</td>
                <td>${vale.dataRecebimento ? formatDate(vale.dataRecebimento) : '—'}</td>
                <td>${vale.descricao || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td class="text-right"><strong>${formatCurrency(valesSetorista.reduce((acc, v) => acc + v.valor, 0))}</strong></td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '<div class="section"><p class="no-data">Nenhum vale encontrado para este setorista.</p></div>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Individual - ${setorista.nome}</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Relatório Individual de Vales</h1>
            <div class="period">Setorista: ${setorista.nome}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          ${resumoIndividual}
          ${listaValesIndividual}
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

  const getStatusBadge = (recebido: boolean) => {
    if (recebido) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Recebido</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendente</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando vales...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Receipt className="mr-2 h-8 w-8" />
              Vales
            </h1>
            <p className="text-muted-foreground">
              Gestão de vales e adiantamentos
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Relatório Geral
            </Button>
            <Button asChild>
              <Link to="/vales/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Vale
              </Link>
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

      {/* Resumo de Saldo por Setorista */}
      {saldoPorSetorista.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Saldo de Vales por Setorista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {saldoPorSetorista.map((saldo) => (
                <div key={saldo.setorista.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{saldo.setorista.nome}</h3>
                    <span className="text-xs text-muted-foreground">
                      {saldo.quantidadeVales} vale{saldo.quantidadeVales !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pendente:</span>
                      <span className={`font-medium ${saldo.totalPendente > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        {formatCurrency(saldo.totalPendente)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recebido:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(saldo.totalRecebido)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-1 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Saldo Atual:</span>
                        <span className={`font-bold text-lg ${saldo.saldoLiquido > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(saldo.saldoLiquido)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {saldo.saldoLiquido > 0 ? `Devendo R$ ${formatCurrency(saldo.saldoLiquido)} à empresa` : 'Em dia'}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 w-full"
                        onClick={() => handlePrintIndividual(saldo.setorista)}
                      >
                        <Printer className="mr-2 h-3 w-3" />
                        Imprimir Individual
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Resumo Geral */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendente</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.totalPendente, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.totalRecebido, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Geral</p>
                  <p className={`text-lg font-bold ${saldoPorSetorista.reduce((acc, s) => acc + s.saldoLiquido, 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(saldoPorSetorista.reduce((acc, s) => acc + s.saldoLiquido, 0))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vales</CardTitle>
        </CardHeader>
        <CardContent>
          {valesFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Setorista</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Recebimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valesFiltrados.map((vale) => (
                  <TableRow key={vale.id}>
                    <TableCell className="font-medium">
                      {formatDate(vale.data)}
                    </TableCell>
                    <TableCell>
                      {vale.setorista?.nome || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(vale.valor)}
                    </TableCell>
                    <TableCell>{getStatusBadge(vale.recebido)}</TableCell>
                    <TableCell>
                      {vale.dataRecebimento ? formatDate(vale.dataRecebimento) : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {vale.descricao || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/vales/editar/${vale.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(vale)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este vale? Esta ação não pode ser desfeita.
                                <br />
                                <br />
                                <strong>Detalhes:</strong>
                                <br />
                                • Setorista: {vale.setorista?.nome}
                                <br />
                                • Valor: {formatCurrency(vale.valor)}
                                <br />
                                • Status: {vale.recebido ? 'Recebido' : 'Pendente'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmarExclusao}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum vale encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {vales.length === 0 
                  ? 'Comece criando seu primeiro vale'
                  : 'Nenhum vale encontrado com os filtros aplicados'
                }
              </p>
              {vales.length === 0 && (
                <Button asChild>
                  <Link to="/vales/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Vale
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValesList;