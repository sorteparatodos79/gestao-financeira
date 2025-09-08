
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Setorista } from '@/types/models';
import { deleteSetorista, getSetoristas } from '@/services/storageService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';

const SetoristasList = () => {
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [setoristaParaExcluir, setSetoristaParaExcluir] = useState<Setorista | null>(null);

  useEffect(() => {
    carregarSetoristas();
  }, []);

  const carregarSetoristas = async () => {
    try {
      const lista = await getSetoristas();
      setSetoristas(lista);
    } catch (error) {
      console.error('Erro ao carregar setoristas:', error);
      toast.error('Erro ao carregar setoristas');
    }
  };

  const handleDelete = (setorista: Setorista) => {
    setSetoristaParaExcluir(setorista);
  };

  const confirmarExclusao = async () => {
    if (setoristaParaExcluir) {
      try {
        await deleteSetorista(setoristaParaExcluir.id);
        await carregarSetoristas();
        toast.success('Setorista excluído com sucesso!');
        setSetoristaParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir setorista:', error);
        toast.error('Erro ao excluir setorista');
      }
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="mr-2 h-8 w-8" />
              Setoristas
            </h1>
            <p className="text-muted-foreground">
              Gerencie os setoristas do sistema
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/setoristas/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Setorista
            </Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Setoristas</CardTitle>
        </CardHeader>
        <CardContent>
          {setoristas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {setoristas.map((setorista) => (
                  <TableRow key={setorista.id}>
                    <TableCell className="font-medium">{setorista.nome}</TableCell>
                    <TableCell>{setorista.telefone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/setoristas/editar/${setorista.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(setorista)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o setorista {setoristaParaExcluir?.nome}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmarExclusao}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum setorista cadastrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SetoristasList;
