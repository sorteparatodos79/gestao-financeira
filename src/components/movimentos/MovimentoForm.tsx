
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addMovimento, updateMovimento } from '@/services/storageService';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { formatCurrency, formatDate, formatDateForInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ArrowLeft, Check, Plus, Save, Trash2 } from 'lucide-react';

type MovimentoDraft = {
  id: string;
  data: Date;
  setoristaId: string;
  vendas: number;
  comissao: number;
  premios: number;
  valorLiquido: number;
};

const formSchema = z.object({
  data: z.string().nonempty('A data é obrigatória'),
  setoristaId: z.string().nonempty('O setorista é obrigatório'),
  vendas: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de vendas deve ser um número positivo'
  }),
  comissao: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de comissão deve ser um número positivo'
  }),
  premios: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de prêmios deve ser um número positivo'
  })
});

interface MovimentoFormProps {
  movimento?: MovimentoFinanceiro;
  isEdit: boolean;
}

const MovimentoForm = ({ movimento, isEdit }: MovimentoFormProps) => {
  const buildDateFromInput = (value: string): Date => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12);
  };

  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [valorLiquido, setValorLiquido] = useState<number>(0);
  const [drafts, setDrafts] = useState<MovimentoDraft[]>([]);
  const [lockedSetoristaId, setLockedSetoristaId] = useState<string | null>(null);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: movimento ? formatDateForInput(movimento.data) : formatDateForInput(new Date()),
      setoristaId: movimento?.setoristaId || '',
      vendas: movimento?.vendas?.toString() || '0',
      comissao: movimento?.comissao?.toString() || '0',
      premios: movimento?.premios?.toString() || '0',
    }
  });

  useEffect(() => {
    const carregarSetoristas = async () => {
      try {
        const listaSetoristas = await getSetoristas();
        setSetoristas(listaSetoristas);
      } catch (error) {
        console.error('Erro ao carregar setoristas:', error);
        toast.error('Erro ao carregar setoristas');
      }
    };
    
    carregarSetoristas();
  }, []);

  useEffect(() => {
    const values = form.getValues();
    const vendas = Number(values.vendas) || 0;
    const comissao = Number(values.comissao) || 0;
    const premios = Number(values.premios) || 0;
    const liquido = vendas - comissao - premios;
    setValorLiquido(liquido);
  }, [
    form.watch('vendas'),
    form.watch('comissao'),
    form.watch('premios')
  ]);

  const handleEditSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const novoMovimento = {
        id: isEdit && movimento ? movimento.id : uuidv4(),
        data: buildDateFromInput(data.data),
        setoristaId: data.setoristaId,
        vendas: Number(data.vendas),
        comissao: Number(data.comissao),
        comissaoRetida: 0, // Campo removido do formulário, sempre será 0
        premios: Number(data.premios),
        despesas: 0, // Mantemos este campo como zero, pois despesas são registradas em outra tela
        valorLiquido: valorLiquido
      };

      if (isEdit && movimento) {
        await updateMovimento(novoMovimento);
        toast.success('Movimento atualizado com sucesso!');
      } else {
        await addMovimento(novoMovimento);
        toast.success('Movimento cadastrado com sucesso!');
      }
      navigate('/movimentos');
    } catch (error) {
      console.error('Erro ao salvar movimento:', error);
      toast.error('Erro ao salvar movimento');
    }
  };

  const handleAddDraft = async (data: z.infer<typeof formSchema>) => {
    try {
      if (lockedSetoristaId && lockedSetoristaId !== data.setoristaId) {
        toast.error('Todos os lançamentos do lote devem ser do mesmo setorista. Limpe a lista para trocar.');
        return;
      }

      const draft: MovimentoDraft = {
        id: uuidv4(),
        data: buildDateFromInput(data.data),
        setoristaId: data.setoristaId,
        vendas: Number(data.vendas),
        comissao: Number(data.comissao),
        premios: Number(data.premios),
        valorLiquido: valorLiquido
      };

      setDrafts((prev) => [...prev, draft]);
      setLockedSetoristaId(data.setoristaId);

      toast.success('Lançamento adicionado à lista');

      form.reset({
        data: data.data,
        setoristaId: data.setoristaId,
        vendas: '0',
        comissao: '0',
        premios: '0'
      });
    } catch (error) {
      console.error('Erro ao preparar lançamento:', error);
      toast.error('Não foi possível adicionar o lançamento');
    }
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const updated = prev.filter((draft) => draft.id !== id);
      if (updated.length === 0) {
        setLockedSetoristaId(null);
      }
      return updated;
    });
  };

  const clearDrafts = () => {
    setDrafts([]);
    setLockedSetoristaId(null);
  };

  const saveDrafts = async () => {
    if (drafts.length === 0) {
      toast.error('Adicione pelo menos um lançamento antes de salvar.');
      return;
    }

    setIsSavingBatch(true);
    const results = await Promise.allSettled(
      drafts.map((draft) =>
        addMovimento({
          id: draft.id,
          data: draft.data,
          setoristaId: draft.setoristaId,
          vendas: draft.vendas,
          comissao: draft.comissao,
          comissaoRetida: 0,
          premios: draft.premios,
          despesas: 0,
          valorLiquido: draft.valorLiquido
        })
      )
    );

    const successIds = results.reduce<string[]>((acc, result, index) => {
      if (result.status === 'fulfilled') {
        acc.push(drafts[index].id);
      }
      return acc;
    }, []);

    const failureCount = results.filter((result) => result.status === 'rejected').length;
    const successCount = successIds.length;

    if (successCount > 0) {
      toast.success(`${successCount} lançamento${successCount > 1 ? 's' : ''} salvo${successCount > 1 ? 's' : ''} com sucesso!`);
    }

    if (failureCount > 0) {
      toast.error(`${failureCount} lançamento${failureCount > 1 ? 's' : ''} não pôde ser salvo. Tente novamente.`);
    }

    setDrafts((prev) => prev.filter((draft) => !successIds.includes(draft.id)));

    if (successCount > 0 && failureCount === 0) {
      setLockedSetoristaId(null);
      navigate('/movimentos');
    }

    setIsSavingBatch(false);
  };

  const totalDraftLiquid = useMemo(
    () => drafts.reduce((total, draft) => total + draft.valorLiquido, 0),
    [drafts]
  );

  const handleSetoristaChange = (value: string, onChange: (value: string) => void) => {
    if (!isEdit && lockedSetoristaId && lockedSetoristaId !== value) {
      toast.error('Todos os lançamentos do lote devem ser do mesmo setorista. Limpe a lista para trocar.');
      return;
    }
    onChange(value);
  };

  const setoristaSelecionado = useMemo(
    () => setoristas.find((setorista) => setorista.id === (lockedSetoristaId || form.getValues('setoristaId'))),
    [form, lockedSetoristaId, setoristas]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(isEdit ? handleEditSubmit : handleAddDraft)}>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Data do Movimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="setoristaId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Setorista</FormLabel>
                  <FormControl>
                    <SimpleSelect
                      value={field.value}
                      onValueChange={(value) => handleSetoristaChange(value, field.onChange)}
                      placeholder="Selecione um setorista"
                      disabled={!isEdit && Boolean(lockedSetoristaId && lockedSetoristaId !== field.value)}
                    >
                      {setoristas.map((setorista) => (
                        <SimpleSelectItem key={setorista.id} value={setorista.id}>
                          {setorista.nome}
                        </SimpleSelectItem>
                      ))}
                    </SimpleSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4 col-span-3">
              <FormField
                control={form.control}
                name="vendas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendas (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="premios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prêmios (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="rounded-md border border-dashed p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Valor Líquido {isEdit ? '' : 'do lançamento atual'}
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ 
                      color: valorLiquido >= 0 ? 'var(--success)' : 'var(--destructive)' 
                    }}
                  >
                    R$ {valorLiquido.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Calculado automaticamente <br/>
                  (Vendas - Comissão - Prêmios)
                </div>
              </div>
            </div>

            {!isEdit && (
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Lançamentos adicionados</h3>
                    <p className="text-sm text-muted-foreground">
                      {setoristaSelecionado
                        ? `Setorista selecionado: ${setoristaSelecionado.nome}`
                        : 'Você pode adicionar vários dias para o mesmo setorista.'}
                    </p>
                  </div>
                  {drafts.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearDrafts}
                      disabled={isSavingBatch}
                    >
                      Limpar lista
                    </Button>
                  )}
                </div>

                {drafts.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Data</TableHead>
                          <TableHead className="text-right">Vendas</TableHead>
                          <TableHead className="text-right">Comissão</TableHead>
                          <TableHead className="text-right">Prêmios</TableHead>
                          <TableHead className="text-right">Líquido</TableHead>
                          <TableHead className="w-[80px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drafts.map((draft) => (
                          <TableRow key={draft.id}>
                            <TableCell>{formatDate(draft.data)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(draft.vendas)}</TableCell>
                            <TableCell className="text-right text-red-600">
                              -{formatCurrency(draft.comissao)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              -{formatCurrency(draft.premios)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${draft.valorLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(draft.valorLiquido)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDraft(draft.id)}
                                disabled={isSavingBatch}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/40">
                      <span className="text-sm text-muted-foreground">
                        {drafts.length} lançamento{drafts.length > 1 ? 's' : ''} pronto{drafts.length > 1 ? 's' : ''} para salvar
                      </span>
                      <span className={`font-semibold ${totalDraftLiquid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Total líquido: {formatCurrency(totalDraftLiquid)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nenhum lançamento adicionado ainda. Preencha os campos acima e clique em
                    {' '}
                    <span className="font-semibold">Adicionar lançamento</span>.
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/movimentos')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            {isEdit ? (
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSavingBatch}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar lançamento
                </Button>
                <Button
                  type="button"
                  onClick={saveDrafts}
                  disabled={drafts.length === 0 || isSavingBatch}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar {drafts.length > 0 ? `${drafts.length} lançamento${drafts.length > 1 ? 's' : ''}` : 'lançamentos'}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default MovimentoForm;
