
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MovimentoFinanceiro } from '@/types/models';
import { getMovimentos } from '@/services/storageService';
import { toast } from 'sonner';
import MovimentoForm from '@/components/movimentos/MovimentoForm';

const MovimentoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movimento, setMovimento] = useState<MovimentoFinanceiro | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const isEdit = Boolean(id);

  useEffect(() => {
    const carregarMovimento = async () => {
      if (isEdit && id) {
        try {
          const movimentos = await getMovimentos();
          const movimentoEncontrado = movimentos.find(m => m.id === id);
          
          if (movimentoEncontrado) {
            setMovimento(movimentoEncontrado);
          } else {
            toast.error('Movimento não encontrado');
            navigate('/movimentos');
          }
        } catch (error) {
          console.error('Erro ao carregar movimento:', error);
          toast.error('Erro ao carregar movimento');
          navigate('/movimentos');
        }
      }
      
      setLoading(false);
    };
    
    carregarMovimento();
  }, [id, isEdit, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Editar' : 'Novo'} Movimento
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do movimento financeiro' : 'Cadastre um novo movimento financeiro'}
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              Obs: As despesas devem ser lançadas na tela específica de despesas.
            </p>
          </div>
        </div>
      </header>

      <MovimentoForm movimento={movimento} isEdit={isEdit} />
    </div>
  );
};

export default MovimentoPage;
