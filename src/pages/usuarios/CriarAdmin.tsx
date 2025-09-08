import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, UserPlus, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usuariosService } from '@/services/supabaseService';

// Schema de validação para criar administrador
const criarAdminSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  login: z.string().min(3, 'Login deve ter pelo menos 3 caracteres'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirmação de senha é obrigatória'),
  ativo: z.boolean().default(true)
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type CriarAdminFormData = z.infer<typeof criarAdminSchema>;

const CriarAdmin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const form = useForm<CriarAdminFormData>({
    resolver: zodResolver(criarAdminSchema),
    defaultValues: {
      nome: '',
      login: '',
      senha: '',
      confirmarSenha: '',
      ativo: true
    }
  });

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEdit(true);
      setUsuarioId(editId);
      carregarUsuario(editId);
    }
  }, [searchParams]);

  const carregarUsuario = async (id: string) => {
    try {
      const { data: usuario, error } = await usuariosService.getById(id);
      
      if (error) {
        console.error('Erro ao buscar usuário:', error);
        toast.error('Erro ao carregar usuário');
        navigate('/usuarios');
        return;
      }
      
      if (usuario) {
        form.reset({
          nome: usuario.nome,
          login: usuario.login,
          senha: '', // Não carregar senha por segurança
          confirmarSenha: '', // Não carregar senha por segurança
          ativo: usuario.ativo
        });
      } else {
        toast.error('Usuário não encontrado');
        navigate('/usuarios');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      toast.error('Erro ao carregar usuário');
      navigate('/usuarios');
    }
  };

  const onSubmit = async (data: CriarAdminFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEdit && usuarioId) {
        // Atualizar usuário existente
        const updateData: any = {
          nome: data.nome,
          login: data.login,
          role: 'admin',
          ativo: data.ativo
        };
        
        // Só atualizar senha se foi informada
        if (data.senha && data.senha.trim() !== '') {
          updateData.senha = data.senha;
        }
        
        const { error } = await usuariosService.update(usuarioId, updateData);
        
        if (error) {
          console.error('Erro ao atualizar usuário:', error);
          toast.error('Erro ao atualizar usuário');
          return;
        }
        
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const { error } = await usuariosService.create({
          nome: data.nome,
          login: data.login,
          senha: data.senha,
          role: 'admin',
          ativo: data.ativo
        });
        
        if (error) {
          console.error('Erro ao criar administrador:', error);
          toast.error('Erro ao criar administrador');
          return;
        }
        
        toast.success('Administrador criado com sucesso!');
      }
      
      navigate('/usuarios');
    } catch (error) {
      toast.error('Erro ao criar administrador');
      console.error('Erro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoltar = () => {
    navigate('/usuarios');
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoltar}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              {isEdit ? 'Editar Usuário' : 'Criar Administrador'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do usuário' : 'Cadastre um novo administrador no sistema'}
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {isEdit ? 'Dados do Usuário' : 'Dados do Administrador'}
          </CardTitle>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome completo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="nome de usuário" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Nome de usuário para fazer login no sistema
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Mínimo 6 caracteres" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A senha deve ter pelo menos 6 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Digite a senha novamente" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Conta Ativa
                      </FormLabel>
                      <FormDescription>
                        Administradores ativos podem acessar o sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleVoltar}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEdit ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'Salvar Alterações' : 'Criar Administrador'}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CriarAdmin;
