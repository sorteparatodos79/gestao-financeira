import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
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
  getInvestimentos, 
  getSetoristas,
  deleteInvestimento
} from '@/services/storageService';
import { Investimento, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { Edit, Plus, Trash2, Printer, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InvestimentosList = () => {
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
          <title>Lista de Investimentos</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
        </head>
        <body style="margin: 0; padding: 0;">
          <div class="header">
            <h1>Lista de Investimentos</h1>
            <div class="period">${periodo}</div>
            <div class="date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="section ${!temFiltros ? 'no-filters' : ''}">
            <h2>Lista de Investimentos</h2>
            ${temFiltros ? `
              <div class="filters">
                Filtros aplicados: 
                ${dataInicial ? `Data inicial: ${new Date(dataInicial).toLocaleDateString('pt-BR')}` : ''}
                ${dataInicial && dataFinal ? ', ' : ''}
                ${dataFinal ? `Data final: ${new Date(dataFinal).toLocaleDateString('pt-BR')}` : ''}
                ${(dataInicial || dataFinal) && (setoristaId && setoristaId !== 'all') ? ', ' : ''}
                ${setoristaId && setoristaId !== 'all' ? `Setorista: ${setoristas.find(s => s.id === setoristaId)?.nome || 'N/A'}` : ''}
                ${((dataInicial || dataFinal) || (setoristaId && setoristaId !== 'all')) && (tipoInvestimento && tipoInvestimento !== 'all') ? ', ' : ''}
                ${tipoInvestimento && tipoInvestimento !== 'all' ? `Tipo: ${tipoInvestimento}` : ''}
              </div>
            ` : ''}
            
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
                ${investimentosFiltrados.length > 0 ? investimentosFiltrados.map(investimento => `
                  <tr>
                    <td>${formatDate(investimento.data)}</td>
                    <td>${investimento.setorista?.nome || 'N/A'}</td>
                    <td>${investimento.tipoInvestimento}</td>
                    <td class="text-right">${formatCurrency(investimento.valor)}</td>
                    <td>${investimento.descricao || '—'}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" class="no-data">Nenhum investimento encontrado com os filtros aplicados.</td>
                  </tr>
                `}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="font-bold">TOTAL</td>
                  <td class="text-right font-bold">${formatCurrency(calcularTotal())}</td>
                  <td></td>
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
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  const [tipoInvestimento, setTipoInvestimento] = useState('all');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [investimentos, dataInicial, dataFinal, setoristaId, tipoInvestimento]);

  const carregarDados = async () => {
    try {
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);
      
      const listaInvestimentos = await getInvestimentos();
      
      // Adicionar informações do setorista
      const investimentosComSetorista = listaInvestimentos.map(investimento => {
        const setorista = listaSetoristas.find(s => s.id === investimento.setoristaId);
        return {
          ...investimento,
          setorista
        };
      });
      
      // Ordenar por data (mais antigo primeiro)
      investimentosComSetorista.sort((a, b) => a.data.getTime() - b.data.getTime());
      
      setInvestimentos(investimentosComSetorista);
      setInvestimentosFiltrados(investimentosComSetorista);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...investimentos];

    if (dataInicial) {
      const dataIni = new Date(dataInicial + 'T00:00:00'); // Força horário local
      resultado = resultado.filter(i => {
        const dataCompara = new Date(i.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara >= dataIni;
      });
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal + 'T23:59:59'); // Força horário local
      resultado = resultado.filter(i => {
        const dataCompara = new Date(i.data);
        dataCompara.setHours(0, 0, 0, 0);
        return dataCompara <= dataFim;
      });
    }

    if (setoristaId && setoristaId !== 'all') {
      resultado = resultado.filter(i => i.setoristaId === setoristaId);
    }

    if (tipoInvestimento && tipoInvestimento !== 'all') {
      resultado = resultado.filter(i => i.tipoInvestimento === tipoInvestimento);
    }

    setInvestimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
    setTipoInvestimento('all');
  };

  const handleDelete = (id: string) => {
    deleteInvestimento(id);
    carregarDados();
    toast.success('Investimento excluído com sucesso!');
  };

  const calcularTotal = () => {
    return investimentosFiltrados.reduce((acc, investimento) => acc + investimento.valor, 0);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Investimentos</h1>
            <p className="text-muted-foreground">
              Gerencie os investimentos do seu negócio
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Link to="/investimentos/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
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
              <Label htmlFor="tipo-investimento">Tipo de Investimento</Label>
              <SimpleSelect value={tipoInvestimento} onValueChange={setTipoInvestimento} placeholder="Todos">
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                <SimpleSelectItem value="Aquisição de Vendedores">Aquisição de Vendedores</SimpleSelectItem>
                <SimpleSelectItem value="Equipamento">Equipamento</SimpleSelectItem>
                <SimpleSelectItem value="Publicidade">Publicidade</SimpleSelectItem>
                <SimpleSelectItem value="Desenvolvimento de Software">Desenvolvimento de Software</SimpleSelectItem>
                <SimpleSelectItem value="Treinamento">Treinamento</SimpleSelectItem>
                <SimpleSelectItem value="Infraestrutura">Infraestrutura</SimpleSelectItem>
                <SimpleSelectItem value="Outros">Outros</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-4">
        <Table>
          <TableCaption>
            Lista de investimentos
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Setorista</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investimentosFiltrados.length > 0 ? (
              investimentosFiltrados.map((investimento) => (
                <TableRow key={investimento.id}>
                  <TableCell>{formatDate(investimento.data)}</TableCell>
                  <TableCell>{investimento.setorista?.nome || 'N/A'}</TableCell>
                  <TableCell>{investimento.tipoInvestimento}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(investimento.valor)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{investimento.descricao || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/investimentos/editar/${investimento.id}`}>
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá excluir o investimento permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(investimento.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhum investimento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(calcularTotal())}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default InvestimentosList;
