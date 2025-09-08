
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleSelect, SimpleSelectItem } from '@/components/ui/simple-select';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Usuario } from '@/types/models';
import { usuariosService } from '@/services/supabaseService';

const createFormSchema = (isEdit: boolean) => z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  login: z.string().min(3, 'O login deve ter pelo menos 3 caracteres'),
  senha: isEdit ? z.string().optional() : z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'user'], {
    required_error: 'Selecione um perfil',
  }),
  ativo: z.boolean().default(true)
}).refine((data) => {
  // Se é edição, senha é opcional, mas se fornecida deve ter pelo menos 6 caracteres
  if (isEdit) {
    return !data.senha || data.senha.length >= 6;
  }
  return true; // Para criação, a validação já é feita no campo
}, {
  message: "A senha deve ter pelo menos 6 caracteres",
  path: ["senha"],
});

type FormData = {
  nome: string;
  login: string;
  senha?: string;
  role: 'admin' | 'user';
  ativo: boolean;
};

const UsuarioPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const form = useForm<FormData>({
    resolver: zodResolver(createFormSchema(isEdit)),
    defaultValues: {
      nome: '',
      login: '',
      senha: '',
      role: 'user',
      ativo: true
    }
  });
  
  useEffect(() => {
    const carregarUsuario = async () => {
      if (isEdit && id) {
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
              role: usuario.role,
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
      }
    };
    
    carregarUsuario();
  }, [isEdit, id, form, navigate]);
  
  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && id) {
        // Atualizar usuário existente
        const updateData: any = {
          nome: data.nome,
          login: data.login,
          role: data.role,
          ativo: data.ativo
        };
        
        // Só atualizar senha se foi informada
        if (data.senha && data.senha.trim() !== '') {
          updateData.senha = data.senha;
        }
        
        const { error } = await usuariosService.update(id, updateData);
        
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
          role: data.role,
          ativo: data.ativo
        });
        
        if (error) {
          console.error('Erro ao criar usuário:', error);
          toast.error('Erro ao criar usuário');
          return;
        }
        
        toast.success('Usuário cadastrado com sucesso!');
      }
      
      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    }
  };
  
  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <User className="mr-2 h-8 w-8" />
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do usuário' : 'Preencha as informações para criar um novo usuário'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/usuarios')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" />
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
                      <Input {...field} placeholder="nome de usuário" />
                    </FormControl>
                    <FormDescription>
                      Nome de usuário para fazer login no sistema
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" />
                    </FormControl>
                    <FormDescription>
                      {isEdit ? 'Deixe em branco para manter a senha atual' : 'A senha deve ter pelo menos 6 caracteres'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <FormControl>
                        <SimpleSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um perfil"
                        >
                          <SimpleSelectItem value="user">Usuário</SimpleSelectItem>
                          <SimpleSelectItem value="admin">Administrador</SimpleSelectItem>
                        </SimpleSelect>
                      </FormControl>
                      <FormDescription>
                        Selecione o perfil do usuário
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status do usuário</FormLabel>
                        <FormDescription>
                          {field.value ? 'Usuário ativo no sistema' : 'Usuário inativo no sistema'}
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
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default UsuarioPage;
