-- Script SQL simplificado para criar a tabela de comissões retidas
-- Execute este script no Supabase SQL Editor se o script completo não funcionar

-- Criar tabela comissoes_retidas (versão simplificada)
CREATE TABLE comissoes_retidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  setorista_id UUID NOT NULL REFERENCES setoristas(id),
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- Política básica de acesso
CREATE POLICY "Enable all access for authenticated users" ON comissoes_retidas
    FOR ALL USING (auth.role() = 'authenticated');
