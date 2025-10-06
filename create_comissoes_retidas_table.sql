-- Script SQL para criar a tabela de comissões retidas
-- Execute este script no Supabase SQL Editor

-- Criar tabela comissoes_retidas
CREATE TABLE IF NOT EXISTS comissoes_retidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  setorista_id UUID NOT NULL REFERENCES setoristas(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comissoes_retidas_data ON comissoes_retidas(data);
CREATE INDEX IF NOT EXISTS idx_comissoes_retidas_setorista_id ON comissoes_retidas(setorista_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_retidas_created_at ON comissoes_retidas(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comissoes_retidas_updated_at 
    BEFORE UPDATE ON comissoes_retidas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir acesso a todos os usuários autenticados
CREATE POLICY "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários na tabela e colunas
COMMENT ON TABLE comissoes_retidas IS 'Tabela para armazenar comissões retidas dos setoristas';
COMMENT ON COLUMN comissoes_retidas.id IS 'Identificador único da comissão retida';
COMMENT ON COLUMN comissoes_retidas.data IS 'Data da comissão retida';
COMMENT ON COLUMN comissoes_retidas.setorista_id IS 'ID do setorista que teve a comissão retida';
COMMENT ON COLUMN comissoes_retidas.valor IS 'Valor da comissão retida em reais';
COMMENT ON COLUMN comissoes_retidas.descricao IS 'Descrição opcional do motivo da comissão retida';
COMMENT ON COLUMN comissoes_retidas.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN comissoes_retidas.updated_at IS 'Data da última atualização do registro';
