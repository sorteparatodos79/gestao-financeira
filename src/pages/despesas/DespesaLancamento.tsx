
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { getSetoristas, addDespesa } from '@/services/storageService';
import { Setorista, TipoDespesa } from '@/types/models';
import { formatDateForInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { ArrowLeft, FileText, PlusCircle, Receipt } from 'lucide-react';

// Lista de tipos de despesa
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

// Schema de validação simplificado para lançamento rápido
const formSchema = z.object({
  data: z.string().nonempty('A data é obrigatória'),
  setoristaId: z.string().nonempty('O setorista é obrigatório'),
  tipoDespesa: z.string().nonempty('O tipo de despesa é obrigatório'),
  valor: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
    message: 'Valor deve ser um número positivo'
  }),
});

const DespesaLancamento = () => {
  const navigate = useNavigate();
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: formatDateForInput(new Date()),
      setoristaId: '',
      tipoDespesa: '',
      valor: '',
    }
  });

  // Carregar setoristas do sistema
  useEffect(() => {
    const carregarSetoristas = async () => {
      try {
        const listaSetoristas = await getSetoristas();
        setSetoristas(listaSetoristas);
        
        // Se houver apenas um setorista, seleciona-o automaticamente
        if (listaSetoristas.length === 1) {
          form.setValue('setoristaId', listaSetoristas[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar setoristas:', error);
        toast.error('Erro ao carregar setoristas');
      }
    };
    
    carregarSetoristas();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Cria a nova despesa com dados simplificados
      const novaDespesa = {
        id: uuidv4(),
        data: new Date(data.data),
        setoristaId: data.setoristaId,
        tipoDespesa: data.tipoDespesa as TipoDespesa,
        valor: Number(data.valor),
        descricao: '', // Descrição vazia para lançamento rápido
      };

      addDespesa(novaDespesa);
      toast.success('Despesa lançada com sucesso!');
      
      // Reset do formulário para facilitar múltiplos lançamentos
      form.reset({
        data: formatDateForInput(new Date()),
        setoristaId: data.setoristaId, // Mantém o setorista selecionado
        tipoDespesa: '',
        valor: '',
      });
    } catch (error) {
      toast.error('Erro ao lançar despesa');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Lançamento Rápido de Despesa</h1>
            <p className="text-muted-foreground">
              Registre rapidamente uma nova despesa no sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/despesas')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/despesas/novo')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Formulário Completo
            </Button>
          </div>
        </div>
      </header>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2" />
            Lançar Despesa
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
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
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <SimpleSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Tipo de despesa"
                        >
                          {tiposDespesa.map((tipo) => (
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
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Lançar Despesa
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Botão flutuante para adicionar outra despesa */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => navigate('/despesas/novo')}
          size="lg"
          className="rounded-full shadow-lg"
        >
          <FileText className="h-5 w-5 mr-2" />
          Formulário Completo
        </Button>
      </div>
    </div>
  );
};

export default DespesaLancamento;
