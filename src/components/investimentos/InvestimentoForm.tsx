
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addInvestimento, updateInvestimento } from '@/services/storageService';
import { Investimento, Setorista, TipoInvestimento } from '@/types/models';
import { formatDateForInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

// Schema de validação
const formSchema = z.object({
  data: z.string().nonempty('A data é obrigatória'),
  setoristaId: z.string().nonempty('O setorista é obrigatório'),
  tipoInvestimento: z.string().nonempty('O tipo de investimento é obrigatório'),
  valor: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
    message: 'Valor deve ser um número positivo'
  }),
  descricao: z.string().optional(),
});

// Lista de tipos de investimento
const tiposInvestimento: TipoInvestimento[] = [
  'Aquisição de Vendedores',
  'Equipamento',
  'Publicidade',
  'Desenvolvimento de Software',
  'Treinamento',
  'Infraestrutura',
  'Outros'
];

interface InvestimentoFormProps {
  investimento?: Investimento;
  isEdit: boolean;
}

const InvestimentoForm = ({ investimento, isEdit }: InvestimentoFormProps) => {
  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);

  // Configuração do formulário com react-hook-form e zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: investimento ? formatDateForInput(investimento.data) : formatDateForInput(new Date()),
      setoristaId: investimento?.setoristaId || '',
      tipoInvestimento: investimento?.tipoInvestimento || '',
      valor: investimento?.valor ? investimento.valor.toString() : '',
      descricao: investimento?.descricao || '',
    }
  });

  // Carregar setoristas do sistema
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const novoInvestimento = {
      id: isEdit && investimento ? investimento.id : uuidv4(),
      data: new Date(data.data),
      setoristaId: data.setoristaId,
      tipoInvestimento: data.tipoInvestimento as TipoInvestimento, // Convertemos explicitamente para TipoInvestimento
      valor: Number(data.valor),
      descricao: data.descricao || '',
    };

    if (isEdit && investimento) {
      updateInvestimento(novoInvestimento);
      toast.success('Investimento atualizado com sucesso!');
    } else {
      addInvestimento(novoInvestimento);
      toast.success('Investimento cadastrado com sucesso!');
    }
    navigate('/investimentos');
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
                  <FormLabel>Data do Investimento</FormLabel>
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
              name="tipoInvestimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Investimento</FormLabel>
                  <FormControl>
                    <SimpleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione o tipo"
                    >
                      {tiposInvestimento.map((tipo) => (
                        <SimpleSelectItem key={tipo} value={tipo}>
                          {tipo}
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
                  <FormLabel>Valor (R$)</FormLabel>
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
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhes sobre o investimento..."
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
              onClick={() => navigate('/investimentos')}
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

export default InvestimentoForm;
