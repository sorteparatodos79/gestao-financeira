-- Script para criar a tabela de vales no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se a tabela já existe e removê-la se necessário
DROP TABLE IF EXISTS vales CASCADE;

-- Criar tabela vales
CREATE TABLE vales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  setorista_id UUID NOT NULL REFERENCES setoristas(id) ON DELETE CASCADE,
  tipo_vale TEXT NOT NULL CHECK (tipo_vale IN ('Adiantamento', 'Comissão', 'Prêmio', 'Despesa', 'Outros')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Recebido', 'Cancelado')),
  data_recebimento DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_vales_data ON vales(data);
CREATE INDEX idx_vales_setorista_id ON vales(setorista_id);
CREATE INDEX idx_vales_status ON vales(status);
CREATE INDEX idx_vales_tipo_vale ON vales(tipo_vale);

-- Habilitar RLS (Row Level Security)
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;

-- Criar política para permitir acesso a usuários autenticados
CREATE POLICY "Permitir acesso a vales para usuários autenticados" ON vales
  FOR ALL USING (auth.role() = 'authenticated');

-- Criar função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_vales_updated_at ON vales;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_vales_updated_at 
  BEFORE UPDATE ON vales 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE vales IS 'Tabela para controle de vales dos setoristas';
COMMENT ON COLUMN vales.data IS 'Data do vale';
COMMENT ON COLUMN vales.setorista_id IS 'ID do setorista';
COMMENT ON COLUMN vales.tipo_vale IS 'Tipo do vale: Adiantamento, Comissão, Prêmio, Despesa, Outros';
COMMENT ON COLUMN vales.valor IS 'Valor do vale';
COMMENT ON COLUMN vales.descricao IS 'Descrição do vale';
COMMENT ON COLUMN vales.status IS 'Status do vale: Pendente, Recebido, Cancelado';
COMMENT ON COLUMN vales.data_recebimento IS 'Data de recebimento do vale';
COMMENT ON COLUMN vales.observacoes IS 'Observações adicionais';

-- Verificar se a tabela foi criada corretamente
SELECT 'Tabela vales criada com sucesso!' as status;