
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Setorista } from '@/types/models';
import { getSetoristaById } from '@/services/storageService';
import { toast } from 'sonner';
import SetoristaForm from '@/components/setoristas/SetoristaForm';

const SetoristaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [setorista, setSetorista] = useState<Setorista | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const isEdit = Boolean(id);

  useEffect(() => {
    const carregarSetorista = async () => {
      if (isEdit && id) {
        try {
          const setoristaEncontrado = await getSetoristaById(id);
          
          if (setoristaEncontrado) {
            setSetorista(setoristaEncontrado);
          } else {
            toast.error('Setorista não encontrado');
            navigate('/setoristas');
          }
        } catch (error) {
          console.error('Erro ao carregar setorista:', error);
          toast.error('Erro ao carregar setorista');
          navigate('/setoristas');
        }
      }
      
      setLoading(false);
    };
    
    carregarSetorista();
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
              {isEdit ? 'Editar' : 'Novo'} Setorista
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do setorista' : 'Cadastre um novo setorista no sistema'}
            </p>
          </div>
        </div>
      </header>

      <SetoristaForm setorista={setorista} isEdit={isEdit} />
    </div>
  );
};

export default SetoristaPage;
