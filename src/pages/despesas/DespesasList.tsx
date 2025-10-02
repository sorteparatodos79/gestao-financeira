import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  getDespesas, 
  deleteDespesa, 
  getSetoristas 
} from '@/services/storageService';
import { Despesa, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Download, Edit, Plus, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DespesasList = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const navigate = useNavigate();

  const handlePrint = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Erro: Não foi possível abrir nova janela');
      return;
    }

    // Obter dados para o PDF
    const total = calcularTotal();
    
    // Formatar período se houver filtros de data
    const periodoTexto = dataInicial && dataFinal 
      ? `Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`
      : 'Todas as despesas';

    // Formatar filtros ativos
    const filtrosAtivos = [];
    if (setoristaId && setoristaId !== 'all') {
      const setorista = setoristas.find(s => s.id === setoristaId);
      if (setorista) filtrosAtivos.push(`Setorista: ${setorista.nome}`);
    }
    if (tipoDespesa && tipoDespesa !== 'all') {
      filtrosAtivos.push(`Tipo: ${tipoDespesa}`);
    }
    
    // Debug: verificar se não há filtros aplicados
    const temFiltros = dataInicial || dataFinal || (setoristaId && setoristaId !== 'all') || (tipoDespesa && tipoDespesa !== 'all');

    // Gerar tabela de despesas
    const tabelaDespesas = despesasFiltradas.length > 0 ? `
      <div class="section ${!temFiltros ? 'no-filters' : ''}">
        <h2>Lista de Despesas</h2>
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
            ${despesasFiltradas.map(despesa => `
              <tr>
                <td>${formatDate(despesa.data)}</td>
                <td>${despesa.setorista?.nome || 'N/A'}</td>
                <td>${despesa.tipoDespesa}</td>
                <td class="text-right">${formatCurrency(despesa.valor)}</td>
                <td>${despesa.descricao || '—'}</td>
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
    ` : '<div class="section"><p class="no-data">Nenhuma despesa encontrada com os filtros aplicados.</p></div>';

    // CSS otimizado para impressão
    const styles = `
      <style>
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        html, body { 
          margin: 0 !important; 
          padding: 0 !important; 
          height: auto !important;
        }
        body { 
          padding: 15px; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 13px;
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
          padding: 10px 0;
          border-bottom: 2px solid #000;
          font-weight: 700;
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
            margin: 2px 0 !important; 
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
            font-size: 9px !important; 
            font-weight: 600; 
            margin: 0 !important;
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
      </style>
    `;

    // HTML completo
    const htmlContent = `
      <!DOCTYPE html>
      <html style="margin: 0; padding: 0; height: auto;">
        <head>
          <title>Lista de Despesas</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
        </head>
        <body style="margin: 0; padding: 8px;">
          <div class="header">
            <h1>Lista de Despesas</h1>
            <div class="period">${periodoTexto}</div>
            <div class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>

          ${tabelaDespesas}
        </body>
      </html>
    `;

    // Escrever conteúdo e imprimir
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        toast.success('Relatório de despesas gerado com sucesso!');
      }, 500);
    };
  };
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('all');
  const [tipoDespesa, setTipoDespesa] = useState('all');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [despesas, dataInicial, dataFinal, setoristaId, tipoDespesa]);

  const carregarDados = async () => {
    try {
      console.log('Iniciando carregamento dos dados...');
      
      const listaSetoristas = await getSetoristas();
      console.log('Setoristas carregados:', listaSetoristas.length);
      setSetoristas(listaSetoristas);
      
      console.log('Carregando despesas...');
      const listaDespesas = await getDespesas();
      console.log('Despesas carregadas:', listaDespesas.length);
      
      // Adicionar informações do setorista
      const despesasComSetorista = listaDespesas.map(despesa => {
        const setorista = listaSetoristas.find(s => s.id === despesa.setoristaId);
        return {
          ...despesa,
          setorista
        };
      });
      
      // Ordenar por data (mais antigo primeiro)
      despesasComSetorista.sort((a, b) => a.data.getTime() - b.data.getTime());
      
      setDespesas(despesasComSetorista);
      setDespesasFiltradas(despesasComSetorista);
      console.log('Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro detalhado ao carregar dados:', error);
      toast.error(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...despesas];

    console.log('=== DEBUG FILTROS ===');
    console.log('Filtro dataInicial:', dataInicial);
    console.log('Filtro dataFinal:', dataFinal);
    console.log('Total despesas antes dos filtros:', resultado.length);

    if (dataInicial) {
      const dataIni = new Date(dataInicial + 'T00:00:00'); // Força horário local
      console.log('Data inicial processada:', dataIni);
      
      resultado = resultado.filter(d => {
        const dataCompara = new Date(d.data);
        dataCompara.setHours(0, 0, 0, 0);
        const passa = dataCompara >= dataIni;
        console.log(`Despesa ${d.id}: ${d.data} (${dataCompara}) >= ${dataIni} = ${passa}`);
        return passa;
      });
      console.log('Despesas após filtro inicial:', resultado.length);
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal + 'T23:59:59'); // Força horário local
      console.log('Data final processada:', dataFim);
      
      resultado = resultado.filter(d => {
        const dataCompara = new Date(d.data);
        dataCompara.setHours(0, 0, 0, 0);
        const passa = dataCompara <= dataFim;
        console.log(`Despesa ${d.id}: ${d.data} (${dataCompara}) <= ${dataFim} = ${passa}`);
        return passa;
      });
      console.log('Despesas após filtro final:', resultado.length);
    }

    if (setoristaId && setoristaId !== 'all') {
      resultado = resultado.filter(d => d.setoristaId === setoristaId);
    }

    if (tipoDespesa && tipoDespesa !== 'all') {
      resultado = resultado.filter(d => d.tipoDespesa === tipoDespesa);
    }

    console.log('Resultado final:', resultado.length);
    console.log('===================');

    setDespesasFiltradas(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('all');
    setTipoDespesa('all');
  };

  const handleEditar = (id: string) => {
    navigate(`/despesas/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteDespesa(id);
    setDespesas(prevDespesas => prevDespesas.filter(despesa => despesa.id !== id));
    setDespesasFiltradas(prevDespesas => prevDespesas.filter(despesa => despesa.id !== id));
    toast.success('Despesa excluída com sucesso!');
  };

  const calcularTotal = () => {
    return despesasFiltradas.reduce((acc, despesa) => acc + despesa.valor, 0);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Despesas</h1>
            <p className="text-muted-foreground">
              Gerencie as despesas do seu negócio
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={() => navigate('/despesas/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
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
              <Label htmlFor="tipo-despesa">Tipo de Despesa</Label>
              <SimpleSelect value={tipoDespesa} onValueChange={setTipoDespesa} placeholder="Todos">
                <SimpleSelectItem value="all">Todos</SimpleSelectItem>
                <SimpleSelectItem value="Salario Mensal">Salario Mensal</SimpleSelectItem>
                <SimpleSelectItem value="Quinzena">Quinzena</SimpleSelectItem>
                <SimpleSelectItem value="Comissão">Comissão</SimpleSelectItem>
                <SimpleSelectItem value="Internet">Internet</SimpleSelectItem>
                <SimpleSelectItem value="Aluguel">Aluguel</SimpleSelectItem>
                <SimpleSelectItem value="Ajuda de Custos">Ajuda de Custos</SimpleSelectItem>
                <SimpleSelectItem value="Combustivel">Combustivel</SimpleSelectItem>
                <SimpleSelectItem value="Material de Limpeza">Material de Limpeza</SimpleSelectItem>
                <SimpleSelectItem value="Alimentação">Alimentação</SimpleSelectItem>
                <SimpleSelectItem value="Sistema">Sistema</SimpleSelectItem>
                <SimpleSelectItem value="Chips">Chips</SimpleSelectItem>
                <SimpleSelectItem value="Descarrego">Descarrego</SimpleSelectItem>
                <SimpleSelectItem value="Outros">Outros</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Despesas</span>
              <span className="text-base font-normal">
                Total: <strong>{formatCurrency(calcularTotal())}</strong>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {despesasFiltradas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Setorista</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesasFiltradas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell>{formatDate(despesa.data)}</TableCell>
                      <TableCell>{despesa.setorista?.nome || 'N/A'}</TableCell>
                      <TableCell>{despesa.tipoDespesa}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(despesa.valor)}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {despesa.descricao || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditar(despesa.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(despesa.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(calcularTotal())}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma despesa encontrada com os filtros aplicados.
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default DespesasList;
