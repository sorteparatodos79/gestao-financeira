
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addMovimento, updateMovimento } from '@/services/storageService';
import { MovimentoFinanceiro, Setorista } from '@/types/models';
import { formatDateForInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { ArrowLeft, Save } from 'lucide-react';

const formSchema = z.object({
  data: z.string().nonempty('A data é obrigatória'),
  setoristaId: z.string().nonempty('O setorista é obrigatório'),
  vendas: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de vendas deve ser um número positivo'
  }),
  comissao: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de comissão deve ser um número positivo'
  }),
  comissaoRetida: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: 'Valor de comissão retida deve ser um número positivo'
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
  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [valorLiquido, setValorLiquido] = useState<number>(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: movimento ? formatDateForInput(movimento.data) : formatDateForInput(new Date()),
      setoristaId: movimento?.setoristaId || '',
      vendas: movimento?.vendas?.toString() || '0',
      comissao: movimento?.comissao?.toString() || '0',
      comissaoRetida: movimento?.comissaoRetida?.toString() || '0',
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
    const comissaoRetida = Number(values.comissaoRetida) || 0;
    const premios = Number(values.premios) || 0;
    const liquido = vendas - comissao - comissaoRetida - premios;
    setValorLiquido(liquido);
  }, [
    form.watch('vendas'),
    form.watch('comissao'),
    form.watch('comissaoRetida'),
    form.watch('premios')
  ]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const novoMovimento = {
        id: isEdit && movimento ? movimento.id : uuidv4(),
        data: new Date(data.data),
        setoristaId: data.setoristaId,
        vendas: Number(data.vendas),
        comissao: Number(data.comissao),
        comissaoRetida: Number(data.comissaoRetida),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                      onValueChange={field.onChange}
                      placeholder="Selecione um setorista"
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

            <div className="grid grid-cols-4 gap-4 col-span-3">
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
                name="comissaoRetida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão Retida (R$)</FormLabel>
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
                  <p className="text-sm text-muted-foreground">Valor Líquido</p>
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
                  (Vendas - Comissão - Comissão Retida - Prêmios)
                </div>
              </div>
            </div>
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
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Atualizar' : 'Salvar'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default MovimentoForm;
