
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Investimento } from '@/types/models';
import { getInvestimentos } from '@/services/storageService';
import { toast } from 'sonner';
import InvestimentoForm from '@/components/investimentos/InvestimentoForm';

const InvestimentoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investimento, setInvestimento] = useState<Investimento | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const isEdit = Boolean(id);

  useEffect(() => {
    const carregarInvestimento = async () => {
      if (isEdit && id) {
        try {
          const investimentos = await getInvestimentos();
          const investimentoEncontrado = investimentos.find(i => i.id === id);
          
          if (investimentoEncontrado) {
            setInvestimento(investimentoEncontrado);
          } else {
            toast.error('Investimento não encontrado');
            navigate('/investimentos');
          }
        } catch (error) {
          console.error('Erro ao carregar investimento:', error);
          toast.error('Erro ao carregar investimento');
          navigate('/investimentos');
        }
      }
      
      setLoading(false);
    };
    
    carregarInvestimento();
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
              {isEdit ? 'Editar' : 'Novo'} Investimento
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do investimento' : 'Cadastre um novo investimento no sistema'}
            </p>
          </div>
        </div>
      </header>

      <InvestimentoForm investimento={investimento} isEdit={isEdit} />
    </div>
  );
};

export default InvestimentoPage;
