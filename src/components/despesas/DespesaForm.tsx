import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addDespesa, updateDespesa } from '@/services/storageService';
import { Despesa, Setorista, TipoDespesa } from '@/types/models';
import { formatDateForInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

const formSchema = z.object({
  data: z.string().nonempty('A data é obrigatória'),
  setoristaId: z.string().nonempty('O setorista é obrigatório'),
  tipoDespesa: z.string().nonempty('O tipo de despesa é obrigatório'),
  valor: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
    message: 'Valor deve ser um número positivo'
  }),
  descricao: z.string().optional(),
});

const tiposDespesa: TipoDespesa[] = [
  'Salario Mensal',
  'Quinzena',
  'Comissão',
  'Internet',
  'Aluguel',
  'Ajuda de Custos',
  'Combustivel',
  'Material de Limpeza',
  'Alimentação',
  'Sistema',
  'Chips',
  'Descarrego',
  'Outros'
];

interface DespesaFormProps {
  despesa?: Despesa;
  isEdit: boolean;
}

const DespesaForm = ({ despesa, isEdit }: DespesaFormProps) => {
  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: despesa ? formatDateForInput(despesa.data) : formatDateForInput(new Date()),
      setoristaId: despesa?.setoristaId || '',
      tipoDespesa: despesa?.tipoDespesa || '',
      valor: despesa?.valor ? despesa.valor.toString() : '',
      descricao: despesa?.descricao || '',
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const novaDespesa = {
        id: isEdit && despesa ? despesa.id : uuidv4(),
        data: new Date(data.data),
        setoristaId: data.setoristaId,
        tipoDespesa: data.tipoDespesa as TipoDespesa,
        valor: Number(data.valor),
        descricao: data.descricao || '',
      };

      if (isEdit && despesa) {
        await updateDespesa(novaDespesa);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await addDespesa(novaDespesa);
        toast.success('Despesa cadastrada com sucesso!');
      }
      navigate('/despesas');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Despesa</FormLabel>
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
                <FormItem>
                  <FormLabel>Setorista</FormLabel>
                  <FormControl>
                    <SimpleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione um setorista"
                    >
                      {setoristas.length > 0 ? (
                        setoristas.map((setorista) => (
                          <SimpleSelectItem key={setorista.id} value={setorista.id}>
                            {setorista.nome}
                          </SimpleSelectItem>
                        ))
                      ) : (
                        <SimpleSelectItem value="loading" disabled>
                          Carregando setoristas...
                        </SimpleSelectItem>
                      )}
                    </SimpleSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoDespesa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Despesa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de despesa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposDespesa.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhes sobre a despesa..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/despesas')}
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

export default DespesaForm;