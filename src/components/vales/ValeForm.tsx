import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save, X, Calendar, User, DollarSign, FileText } from "lucide-react";
import { Vale, Setorista } from "@/types/models";
import { formatCurrency } from "@/utils/formatters";

const valeSchema = z.object({
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  setoristaId: z.string().min(1, "Selecione um setorista"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  descricao: z.string().optional(),
  recebido: z.boolean().default(false),
  dataRecebimento: z.date().optional(),
});

type ValeFormData = z.infer<typeof valeSchema>;

interface ValeFormProps {
  vale: Vale;
  setoristas: Setorista[];
  onSave: (vale: Omit<Vale, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ValeForm = ({ vale, setoristas, onSave, onCancel, loading = false }: ValeFormProps) => {
  const [valorInput, setValorInput] = useState(vale.valor.toString());

  const form = useForm<ValeFormData>({
    resolver: zodResolver(valeSchema),
    defaultValues: {
      data: vale.data,
      setoristaId: vale.setoristaId,
      valor: vale.valor,
      descricao: vale.descricao || '',
      recebido: vale.recebido,
      dataRecebimento: vale.dataRecebimento,
    },
  });

  const watchedRecebido = form.watch('recebido');
  const watchedValor = form.watch('valor');

  // Atualizar o input de valor quando o valor mudar
  useEffect(() => {
    setValorInput(watchedValor.toString());
  }, [watchedValor]);

  const handleValorChange = (value: string) => {
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    
    // Substituir vírgula por ponto para conversão
    const normalizedValue = cleanValue.replace(',', '.');
    
    setValorInput(cleanValue);
    
    // Converter para número
    const numericValue = parseFloat(normalizedValue) || 0;
    form.setValue('valor', numericValue);
  };

  const onSubmit = (data: ValeFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data */}
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data do Vale
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Setorista */}
          <FormField
            control={form.control}
            name="setoristaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Setorista
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setorista" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {setoristas.map((setorista) => (
                      <SelectItem key={setorista.id} value={setorista.id}>
                        {setorista.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor */}
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor (R$)
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={valorInput}
                    onChange={(e) => handleValorChange(e.target.value)}
                    placeholder="0,00"
                  />
                </FormControl>
                <FormDescription>
                  Valor atual: {formatCurrency(field.value)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status de Recebimento */}
          <FormField
            control={form.control}
            name="recebido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">
                      <div>
                        <div className="font-medium">Pendente</div>
                        <div className="text-sm text-muted-foreground">Vale ainda não foi recebido</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="true">
                      <div>
                        <div className="font-medium">Recebido</div>
                        <div className="text-sm text-muted-foreground">Vale já foi recebido</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Recebimento - só aparece se recebido for true */}
          {watchedRecebido && (
            <FormField
              control={form.control}
              name="dataRecebimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Recebimento
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descrição
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o motivo do vale..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descrição opcional sobre o motivo do vale
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ValeForm;