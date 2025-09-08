
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit, Trash2, UserPlus, Users, CheckCircle, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Usuario } from '@/types/models';
import { usuariosService } from '@/services/supabaseService';

const UsuariosList = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    carregarUsuarios();
  }, []);
  
  const carregarUsuarios = async () => {
    try {
      const { data: usuariosData, error } = await usuariosService.getAll();
      
      if (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários');
        return;
      }
      
      const usuariosFormatados = usuariosData?.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        senha: usuario.senha,
        role: usuario.role,
        ativo: usuario.ativo
      })) || [];
      
      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };
  
  const handleExcluir = (id: string) => {
    setUsuarioParaExcluir(id);
    setIsDialogOpen(true);
  };
  
  const confirmarExclusao = async () => {
    if (usuarioParaExcluir) {
      try {
        const { error } = await usuariosService.delete(usuarioParaExcluir);
        
        if (error) {
          console.error('Erro ao excluir usuário:', error);
          toast.error('Erro ao excluir usuário');
          return;
        }
        
        setUsuarios(usuarios.filter(u => u.id !== usuarioParaExcluir));
        toast.success('Usuário excluído com sucesso!');
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };
  
  const toggleAtivo = async (id: string) => {
    try {
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) return;
      
      const { error } = await usuariosService.update(id, {
        ativo: !usuario.ativo
      });
      
      if (error) {
        console.error('Erro ao alterar status do usuário:', error);
        toast.error('Erro ao alterar status do usuário');
        return;
      }
      
      setUsuarios(usuarios.map(u => {
        if (u.id === id) {
          return { ...u, ativo: !u.ativo };
        }
        return u;
      }));
      
      toast.success('Status do usuário alterado com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };
  
  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="mr-2 h-8 w-8" />
              Usuários
            </h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => navigate('/usuarios/criar-admin')}
            >
              <Users className="h-4 w-4 mr-2" />
              Criar Admin
            </Button>
          </div>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.login}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.role === 'admin' ? 'default' : 'outline'}>
                      {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={usuario.ativo} 
                        onCheckedChange={() => toggleAtivo(usuario.id)} 
                      />
                      {usuario.ativo ? (
                        <span className="text-green-600 flex items-center text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/usuarios/criar-admin?edit=${usuario.id}`)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluir(usuario.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarExclusao}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default UsuariosList;
