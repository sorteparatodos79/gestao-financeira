
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { addSetorista, updateSetorista } from '@/services/storageService';
import { Setorista } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

// Schema de validação
const formSchema = z.object({
  nome: z.string().nonempty('O nome é obrigatório'),
  telefone: z.string().nonempty('O telefone é obrigatório')
});

interface SetoristaFormProps {
  setorista?: Setorista;
  isEdit: boolean;
}

const SetoristaForm = ({ setorista, isEdit }: SetoristaFormProps) => {
  const navigate = useNavigate();

  // Configuração do formulário com react-hook-form e zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: setorista?.nome || '',
      telefone: setorista?.telefone || '',
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const novoSetorista = {
        id: isEdit && setorista ? setorista.id : uuidv4(),
        nome: data.nome,
        telefone: data.telefone,
      };

      if (isEdit && setorista) {
        await updateSetorista(novoSetorista);
        toast.success('Setorista atualizado com sucesso!');
      } else {
        await addSetorista(novoSetorista);
        toast.success('Setorista cadastrado com sucesso!');
      }
      navigate('/setoristas');
    } catch (error) {
      console.error('Erro ao salvar setorista:', error);
      toast.error('Erro ao salvar setorista');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Setorista</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(99) 99999-9999" {...field} />
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
              onClick={() => navigate('/setoristas')}
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

export default SetoristaForm;
