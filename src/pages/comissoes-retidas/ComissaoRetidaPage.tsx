import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getComissoesRetidas } from '@/services/storageService';
import { ComissaoRetida } from '@/types/models';
import ComissaoRetidaForm from '@/components/comissoes-retidas/ComissaoRetidaForm';

const ComissaoRetidaPage = () => {
  const { id } = useParams<{ id: string }>();
  const [comissaoRetida, setComissaoRetida] = useState<ComissaoRetida | undefined>();
  const [loading, setLoading] = useState(true);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && id) {
      carregarComissaoRetida(id);
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const carregarComissaoRetida = async (comissaoId: string) => {
    try {
      setLoading(true);
      const comissoes = await getComissoesRetidas();
      const comissaoEncontrada = comissoes.find(c => c.id === comissaoId);
      
      if (comissaoEncontrada) {
        setComissaoRetida(comissaoEncontrada);
      } else {
        toast.error('Comissão retida não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar comissão retida:', error);
      toast.error('Erro ao carregar comissão retida');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? 'Editar Comissão Retida' : 'Nova Comissão Retida'}
        </h1>
        <p className="text-muted-foreground">
          {isEdit 
            ? 'Edite as informações da comissão retida' 
            : 'Cadastre uma nova comissão retida para um setorista'
          }
        </p>
      </div>

      <ComissaoRetidaForm 
        comissaoRetida={comissaoRetida} 
        isEdit={isEdit} 
      />
    </div>
  );
};

export default ComissaoRetidaPage;
