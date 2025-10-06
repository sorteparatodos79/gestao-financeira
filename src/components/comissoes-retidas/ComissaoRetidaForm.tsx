import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addComissaoRetida, updateComissaoRetida } from '@/services/storageService';
import { ComissaoRetida, Setorista } from '@/types/models';
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
  valor: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
    message: 'Valor deve ser um número positivo'
  }),
  descricao: z.string().optional(),
});

interface ComissaoRetidaFormProps {
  comissaoRetida?: ComissaoRetida;
  isEdit: boolean;
}

const ComissaoRetidaForm = ({ comissaoRetida, isEdit }: ComissaoRetidaFormProps) => {
  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: comissaoRetida ? formatDateForInput(comissaoRetida.data) : formatDateForInput(new Date()),
      setoristaId: comissaoRetida?.setoristaId || '',
      valor: comissaoRetida?.valor?.toString() || '0',
      descricao: comissaoRetida?.descricao || '',
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
      const novaComissaoRetida = {
        id: isEdit && comissaoRetida ? comissaoRetida.id : uuidv4(),
        data: new Date(data.data),
        setoristaId: data.setoristaId,
        valor: Number(data.valor),
        descricao: data.descricao || undefined
      };

      if (isEdit && comissaoRetida) {
        await updateComissaoRetida(novaComissaoRetida);
        toast.success('Comissão retida atualizada com sucesso!');
      } else {
        await addComissaoRetida(novaComissaoRetida);
        toast.success('Comissão retida cadastrada com sucesso!');
      }
      navigate('/comissoes-retidas');
    } catch (error) {
      console.error('Erro ao salvar comissão retida:', error);
      toast.error('Erro ao salvar comissão retida');
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
                  <FormLabel>Data da Comissão Retida</FormLabel>
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

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Comissão Retida (R$)</FormLabel>
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
              name="descricao"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informe o motivo da comissão retida..."
                      className="resize-none"
                      rows={3}
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
              onClick={() => navigate('/comissoes-retidas')}
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

export default ComissaoRetidaForm;
