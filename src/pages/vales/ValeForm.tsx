import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Vale, Setorista, TipoVale, StatusVale } from '@/types/models';
import { getValeById, addVale, updateVale, getSetoristas } from '@/services/storageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  setoristaId: z.string().min(1, 'Setorista é obrigatório'),
  tipoVale: z.string().min(1, 'Tipo de vale é obrigatório'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  descricao: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ValeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      setoristaId: '',
      tipoVale: '',
      valor: '',
      descricao: '',
      status: 'Pendente',
      observacoes: ''
    }
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const listaSetoristas = await getSetoristas();
        setSetoristas(listaSetoristas);

        if (isEditing && id) {
          const vale = await getValeById(id);
          if (vale) {
            setValue('data', vale.data.toISOString().split('T')[0]);
            setValue('setoristaId', vale.setoristaId);
            setValue('tipoVale', vale.tipoVale);
            setValue('valor', vale.valor.toString());
            setValue('descricao', vale.descricao || '');
            setValue('status', vale.status);
            setValue('observacoes', vale.observacoes || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    carregarDados();
  }, [id, isEditing, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      const valeData: Omit<Vale, 'id'> = {
        data: new Date(data.data),
        setoristaId: data.setoristaId,
        tipoVale: data.tipoVale as TipoVale,
        valor: parseFloat(data.valor),
        descricao: data.descricao,
        status: data.status as StatusVale,
        observacoes: data.observacoes,
        dataRecebimento: data.status === 'Recebido' ? new Date() : undefined
      };

      if (isEditing && id) {
        await updateVale({ ...valeData, id });
        toast.success('Vale atualizado com sucesso!');
      } else {
        await addVale(valeData);
        toast.success('Vale criado com sucesso!');
      }

      navigate('/vales');
    } catch (error) {
      console.error('Erro ao salvar vale:', error);
      toast.error('Erro ao salvar vale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => navigate('/vales')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar para Vales
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Vale' : 'Novo Vale'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualize as informações do vale' : 'Preencha os dados do novo vale'}
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Vale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  {...register('data')}
                  className={errors.data ? 'border-red-500' : ''}
                />
                {errors.data && (
                  <p className="text-sm text-red-500">{errors.data.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="setorista">Setorista *</Label>
                <SimpleSelect 
                  value={watch('setoristaId')} 
                  onValueChange={(value) => setValue('setoristaId', value)}
                  placeholder="Selecione o setorista"
                >
                  {setoristas.map((setorista) => (
                    <SimpleSelectItem key={setorista.id} value={setorista.id}>
                      {setorista.nome}
                    </SimpleSelectItem>
                  ))}
                </SimpleSelect>
                {errors.setoristaId && (
                  <p className="text-sm text-red-500">{errors.setoristaId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-vale">Tipo de Vale *</Label>
                <SimpleSelect 
                  value={watch('tipoVale')} 
                  onValueChange={(value) => setValue('tipoVale', value)}
                  placeholder="Selecione o tipo"
                >
                  <SimpleSelectItem value="Adiantamento">Adiantamento</SimpleSelectItem>
                  <SimpleSelectItem value="Comissão">Comissão</SimpleSelectItem>
                  <SimpleSelectItem value="Prêmio">Prêmio</SimpleSelectItem>
                  <SimpleSelectItem value="Despesa">Despesa</SimpleSelectItem>
                  <SimpleSelectItem value="Outros">Outros</SimpleSelectItem>
                </SimpleSelect>
                {errors.tipoVale && (
                  <p className="text-sm text-red-500">{errors.tipoVale.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('valor')}
                  className={errors.valor ? 'border-red-500' : ''}
                />
                {errors.valor && (
                  <p className="text-sm text-red-500">{errors.valor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <SimpleSelect 
                  value={watch('status')} 
                  onValueChange={(value) => setValue('status', value)}
                  placeholder="Selecione o status"
                >
                  <SimpleSelectItem value="Pendente">Pendente</SimpleSelectItem>
                  <SimpleSelectItem value="Recebido">Recebido</SimpleSelectItem>
                  <SimpleSelectItem value="Cancelado">Cancelado</SimpleSelectItem>
                </SimpleSelect>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição do vale (opcional)"
                {...register('descricao')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais (opcional)"
                {...register('observacoes')}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vales')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValeForm;
