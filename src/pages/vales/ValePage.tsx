import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";
import { getValeById, addVale, updateVale } from "@/services/storageService";
import { getSetoristas } from "@/services/storageService";
import { Vale, Setorista } from "@/types/models";
import ValeForm from "@/components/vales/ValeForm";

const ValePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vale, setVale] = useState<Vale | null>(null);
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = !!id && id !== 'novo';

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar setoristas
      const listaSetoristas = await getSetoristas();
      setSetoristas(listaSetoristas);

      // Se está editando, carregar o vale
      if (isEditing) {
        const valeData = await getValeById(id!);
        if (valeData) {
          setVale(valeData);
        } else {
          toast.error('Vale não encontrado');
          navigate('/vales');
        }
      } else {
        // Criar um vale vazio para novo registro
        setVale({
          id: '',
          data: new Date(),
          setoristaId: '',
          valor: 0,
          descricao: '',
          recebido: false,
          dataRecebimento: undefined
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (valeData: Omit<Vale, 'id'>) => {
    try {
      setSaving(true);

      if (isEditing) {
        await updateVale({ ...valeData, id: id! });
        toast.success('Vale atualizado com sucesso!');
      } else {
        await addVale(valeData);
        toast.success('Vale criado com sucesso!');
      }

      navigate('/vales');
    } catch (error) {
      console.error('Erro ao salvar vale:', error);
      toast.error('Erro ao salvar vale');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/vales');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!vale) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Vale não encontrado</h3>
        <p className="text-muted-foreground mb-4">
          O vale que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/vales')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Vales
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Vale' : 'Novo Vale'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do vale' : 'Preencha os dados do novo vale'}
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Vale</CardTitle>
        </CardHeader>
        <CardContent>
          <ValeForm
            vale={vale}
            setoristas={setoristas}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValePage;
