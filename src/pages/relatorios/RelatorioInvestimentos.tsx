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
  getInvestimentos, 
  getSetoristas 
} from '@/services/storageService';
import { Investimento, Setorista } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

const RelatorioInvestimentos = () => {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [investimentosFiltrados, setInvestimentosFiltrados] = useState<Investimento[]>([]);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };
  
  // Filtros
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [setoristaId, setSetoristaId] = useState('');
  const [tipoInvestimento, setTipoInvestimento] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [investimentos, dataInicial, dataFinal, setoristaId, tipoInvestimento]);

  const carregarDados = () => {
    const listaSetoristas = getSetoristas();
    setSetoristas(listaSetoristas);
    
    const listaInvestimentos = getInvestimentos();
    
    // Adicionar informações do setorista
    const investimentosComSetorista = listaInvestimentos.map(investimento => {
      const setorista = listaSetoristas.find(s => s.id === investimento.setoristaId);
      return {
        ...investimento,
        setorista
      };
    });
    
    // Ordenar por data (mais recente primeiro)
    investimentosComSetorista.sort((a, b) => b.data.getTime() - a.data.getTime());
    
    setInvestimentos(investimentosComSetorista);
    setInvestimentosFiltrados(investimentosComSetorista);
  };

  const aplicarFiltros = () => {
    let resultado = [...investimentos];

    if (dataInicial) {
      const dataIni = new Date(dataInicial);
      resultado = resultado.filter(i => i.data >= dataIni);
    }

    if (dataFinal) {
      const dataFim = new Date(dataFinal);
      dataFim.setHours(23, 59, 59);
      resultado = resultado.filter(i => i.data <= dataFim);
    }

    if (setoristaId) {
      resultado = resultado.filter(i => i.setoristaId === setoristaId);
    }

    if (tipoInvestimento) {
      resultado = resultado.filter(i => i.tipoInvestimento === tipoInvestimento);
    }

    setInvestimentosFiltrados(resultado);
  };

  const limparFiltros = () => {
    setDataInicial('');
    setDataFinal('');
    setSetoristaId('');
    setTipoInvestimento('');
  };

  const calcularTotal = () => {
    return investimentosFiltrados.reduce((acc, investimento) => acc + investimento.valor, 0);
  };
  
  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Relatório de Investimentos</h1>
            <p className="text-muted-foreground">
              Visualize os dados de investimentos do seu negócio
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="default" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
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
                <SimpleSelectItem value="">Todos</SimpleSelectItem>
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
                <SimpleSelectItem value="">Todos</SimpleSelectItem>
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
      
      {/* Conteúdo que será impresso/gerado como PDF */}
      <div ref={printRef} className="p-4">
        <div className="print-header mb-8">
          <h1 className="text-2xl font-bold text-center">Relatório de Investimentos</h1>
          {dataInicial && dataFinal && (
            <p className="text-center text-muted-foreground">
              Período: {new Date(dataInicial).toLocaleDateString()} a {new Date(dataFinal).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Investimentos</span>
              <span className="text-base font-normal">
                Total: <strong>{formatCurrency(calcularTotal())}</strong>
              </span>
            </CardTitle>
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
                      <TableCell>{formatDate(investimento.data)}</TableCell>
                      <TableCell>{investimento.setorista?.nome || 'N/A'}</TableCell>
                      <TableCell>{investimento.tipoInvestimento}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(investimento.valor)}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {investimento.descricao || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(calcularTotal())}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum investimento encontrado com os filtros aplicados.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatorioInvestimentos;
