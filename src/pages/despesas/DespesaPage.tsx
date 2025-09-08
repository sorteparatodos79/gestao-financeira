
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Despesa } from '@/types/models';
import { getDespesas } from '@/services/storageService';
import { toast } from 'sonner';
import DespesaForm from '@/components/despesas/DespesaForm';

const DespesaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [despesa, setDespesa] = useState<Despesa | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const isEdit = Boolean(id);

  useEffect(() => {
    const carregarDespesa = async () => {
      if (isEdit && id) {
        try {
          const despesas = await getDespesas();
          const despesaEncontrada = despesas.find(d => d.id === id);
          
          if (despesaEncontrada) {
            setDespesa(despesaEncontrada);
          } else {
            toast.error('Despesa não encontrada');
            navigate('/despesas');
          }
        } catch (error) {
          console.error('Erro ao carregar despesa:', error);
          toast.error('Erro ao carregar despesa');
          navigate('/despesas');
        }
      }
      
      setLoading(false);
    };
    
    carregarDespesa();
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
              {isEdit ? 'Editar' : 'Nova'} Despesa
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados da despesa' : 'Cadastre uma nova despesa no sistema'}
            </p>
          </div>
        </div>
      </header>

      <DespesaForm despesa={despesa} isEdit={isEdit} />
    </div>
  );
};

export default DespesaPage;
