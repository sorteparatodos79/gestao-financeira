
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { deleteMovimento, getMovimentos, getSetoristas } from '@/services/storageService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, Printer, Search, ShoppingBag, Trash2, X } from 'lucide-react';

const MovimentosList = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoFinanceiro[]>([]);
  const [movimentoParaExcluir, setMovimentoParaExcluir] = useState<MovimentoFinanceiro | null>(null);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [movimentos, dataInicial, dataFinal, setoristaId]);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaMovimentos = await getMovimentos();
      
      // Adicionar informações do setorista
      const movimentosComSetorista = listaMovimentos.map(movimento => {
        const setorista = listaSetoristas.find(s => s.id === movimento.setoristaId);
        return {
          ...movimento,
          setorista
        };
      });
      
      // Ordenar por data (mais antigo primeiro)
      movimentosComSetorista.sort((a, b) => a.data.getTime() - b.data.getTime());
      
      setMovimentos(movimentosComSetorista);
      setMovimentosFiltrados(movimentosComSetorista);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...movimentos];

    if (dataInicial) {
      const dataIni = new Date(dataInicial + 'T00:00:00'); // Força horário local
      resultado = resultado.filter(m => {
        const dataCompara = new Date(m.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara >= dataIni;
      });
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal + 'T23:59:59'); // Força horário local
      resultado = resultado.filter(m => {
        const dataCompara = new Date(m.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara <= dataFim;
      });
    }

    if (setoristaId) {
      resultado = resultado.filter(m => m.setoristaId === setoristaId);
    }

    setMovimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('');
  };

  const handleDelete = (movimento: MovimentoFinanceiro) => {
    setMovimentoParaExcluir(movimento);
  };

  const confirmarExclusao = () => {
    if (movimentoParaExcluir) {
      deleteMovimento(movimentoParaExcluir.id);
      carregarDados();
      toast.success('Movimento excluído com sucesso!');
      setMovimentoParaExcluir(null);
    }
  };

  const calcularTotais = () => {
    return movimentosFiltrados.reduce((totais, movimento) => ({
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
  };

  const totais = calcularTotais();

  const handlePrint = () => {
    // Verificar se há filtros aplicados
    const temFiltros = dataInicial || dataFinal || setoristaId;
    
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
            margin: 0 !important; 
            padding: 0 !important;
          }
          .section { 
            page-break-inside: avoid !important; 
            page-break-before: avoid !important;
            break-before: avoid !important;
            margin: 0 0 12px 0 !important; 
            padding: 0 !important;
          }
          .section.no-filters { 
            margin: 0 0 12px 0 !important; 
            padding: 0 !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .section h2 { 
            font-size: 15px !important; 
            margin: 0 0 8px 0 !important; 
            padding: 6px 0 !important; 
          }
          .data-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin: 0 0 15px 0 !important; 
            font-size: 10px !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .data-table th, .data-table td { 
            padding: 3px !important; 
            font-weight: 600; 
          }
          .data-table th { font-weight: 700 !important; }
          .total-row { 
            font-weight: 700 !important; 
            background-color: #f8fafc !important;
            color: #000 !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .filters { 
            font-size: 10px !important; 
            margin: 0 0 8px 0 !important; 
            padding: 0 !important;
          }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #000;
          font-weight: 500;
        }
        
        .header {
          text-align: center;
          margin: 0 0 15px 0;
          padding: 0 0 10px 0;
          border-bottom: 2px solid #2563eb;
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .header h1 {
          font-size: 24px;
          margin: 0 0 6px 0;
          color: #1e40af;
          font-weight: 700;
        }
        
        .header .period {
          font-size: 14px;
          color: #6b7280;
          margin: 3px 0;
        }
        
        .header .date {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }
        
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
          page-break-before: avoid;
          break-before: avoid;
        }
        
        .section.no-filters {
          margin-top: 0;
          padding-top: 0;
          page-break-before: avoid;
          break-before: avoid;
        }
        
        .section h2 {
          font-size: 18px;
          color: #000;
          margin: 0 0 15px 0;
          padding: 0;
          font-weight: 600;
        }
        
        .filters {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 15px 0;
          padding: 0;
          font-style: italic;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
          page-break-before: avoid;
          break-before: avoid;
        }
        
        .data-table tbody {
          page-break-inside: auto;
          break-inside: auto;
        }
        
        .data-table tbody tr:nth-last-child(-n+3) {
          page-break-inside: avoid;
          break-inside: avoid;
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
        
        .total-row {
          background-color: #f8fafc !important;
          color: #000 !important;
          font-weight: 700;
          border-top: 2px solid #000 !important;
          page-break-before: avoid;
          break-before: avoid;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .total-row td {
          border: 1px solid #000 !important;
          font-weight: 700;
          background-color: #f8fafc !important;
        }
        
        .text-right { text-align: right; }
        
        .positive { color: hsl(var(--primary)) !important; }
        .negative { color: hsl(var(--destructive)) !important; }
        
        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px;
          background-color: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
        }
      </style>
    `;

    // HTML completo
    const htmlContent = `
      <!DOCTYPE html>
      <html style="margin: 0; padding: 0; height: auto;">
        <head>
          <title>Lista de Movimentos Financeiros</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
        </head>
        <body style="margin: 0; padding: 0;">
          <div class="header">
            <h1>Lista de Movimentos Financeiros</h1>
            <div class="period">${periodo}</div>
            <div class="date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="section ${!temFiltros ? 'no-filters' : ''}">
            <h2>Lista de Movimentos</h2>
            ${temFiltros ? `
              <div class="filters">
                Filtros aplicados: 
                ${dataInicial ? `Data inicial: ${new Date(dataInicial).toLocaleDateString('pt-BR')}` : ''}
                ${dataInicial && dataFinal ? ', ' : ''}
                ${dataFinal ? `Data final: ${new Date(dataFinal).toLocaleDateString('pt-BR')}` : ''}
                ${(dataInicial || dataFinal) && setoristaId ? ', ' : ''}
                ${setoristaId ? `Setorista: ${setoristas.find(s => s.id === setoristaId)?.nome || 'N/A'}` : ''}
              </div>
            ` : ''}
            
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
                  <th class="text-right">Líquido</th>
                </tr>
              </thead>
              <tbody>
                ${movimentosFiltrados.length > 0 ? movimentosFiltrados.map(movimento => `
                  <tr>
                    <td>${formatDate(movimento.data)}</td>
                    <td>${movimento.setorista?.nome || 'N/A'}</td>
                    <td class="text-right">${formatCurrency(movimento.vendas)}</td>
                    <td class="text-right">${formatCurrency(movimento.comissao)}</td>
                    <td class="text-right">${formatCurrency(movimento.comissaoRetida)}</td>
                    <td class="text-right">${formatCurrency(movimento.premios)}</td>
                    <td class="text-right">${formatCurrency(movimento.despesas)}</td>
                    <td class="text-right ${movimento.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(movimento.valorLiquido)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="8" class="no-data">Nenhum movimento encontrado com os filtros aplicados.</td>
                  </tr>
                `}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2" class="font-bold">TOTAL</td>
                  <td class="text-right font-bold">${formatCurrency(totais.vendas)}</td>
                  <td class="text-right font-bold">${formatCurrency(totais.comissao)}</td>
                  <td class="text-right font-bold">${formatCurrency(totais.comissaoRetida)}</td>
                  <td class="text-right font-bold">${formatCurrency(totais.premios)}</td>
                  <td class="text-right font-bold">${formatCurrency(totais.despesas)}</td>
                  <td class="text-right font-bold ${totais.valorLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(totais.valorLiquido)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </body>
      </html>
    `;

    // Criar nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Aguardar o carregamento e imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ShoppingBag className="mr-2 h-8 w-8" />
              Movimentos Financeiros
            </h1>
            <p className="text-muted-foreground">
              Gerenciamento de movimentos financeiros
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button asChild>
            <Link to="/movimentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Movimento
            </Link>
          </Button>
          </div>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="h-4 w-4 mr-2" />
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
                <SimpleSelectItem value="todos">Todos</SimpleSelectItem>
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
          <CardTitle>Lista de Movimentos</CardTitle>
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
                    <TableHead className="text-right">Comissão Retida</TableHead>
                    <TableHead className="text-right">Prêmios</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentosFiltrados.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>{formatDate(movimento.data)}</TableCell>
                      <TableCell>{movimento.setorista?.nome || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.vendas)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.comissao)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(movimento.comissaoRetida)}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/movimentos/editar/${movimento.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(movimento)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarExclusao}>
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.vendas)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.comissao)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totais.comissaoRetida)}</TableCell>
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
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum movimento encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovimentosList;
