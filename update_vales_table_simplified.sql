-- Script para atualizar a tabela vales para versão simplificada
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Verificando tabela vales existente...' as status;

-- 2. Remover tabela existente (CUIDADO: isso apagará todos os dados!)
DROP TABLE IF EXISTS vales CASCADE;

-- 3. Criar tabela vales simplificada
CREATE TABLE vales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  setorista_id UUID NOT NULL REFERENCES setoristas(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT,
  recebido BOOLEAN NOT NULL DEFAULT FALSE,
  data_recebimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX idx_vales_data ON vales(data);
CREATE INDEX idx_vales_setorista_id ON vales(setorista_id);
CREATE INDEX idx_vales_recebido ON vales(recebido);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- 6. Criar política para permitir acesso a usuários autenticados
CREATE POLICY "Permitir acesso a vales para usuários autenticados" ON vales
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_vales_updated_at 
  BEFORE UPDATE ON vales 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Comentários para documentação
COMMENT ON TABLE vales IS 'Tabela para controle de vales dos setoristas (simplificada)';
COMMENT ON COLUMN vales.data IS 'Data do vale';
COMMENT ON COLUMN vales.setorista_id IS 'ID do setorista';
COMMENT ON COLUMN vales.valor IS 'Valor do vale';
COMMENT ON COLUMN vales.descricao IS 'Descrição do vale';
COMMENT ON COLUMN vales.recebido IS 'Se o vale foi recebido (true/false)';
COMMENT ON COLUMN vales.data_recebimento IS 'Data de recebimento do vale';

-- 10. Verificar se a tabela foi criada corretamente
SELECT 'Tabela vales simplificada criada com sucesso!' as status;

-- 11. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vales'
ORDER BY ordinal_position;

-- 12. Testar inserção de um registro de teste (se houver setoristas)
DO $$
DECLARE
  setorista_id_val UUID;
  insert_result TEXT;
BEGIN
  -- Verificar se há setoristas
  SELECT id INTO setorista_id_val FROM setoristas LIMIT 1;
  
  IF setorista_id_val IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO vales (data, setorista_id, valor, descricao, recebido)
    VALUES (CURRENT_DATE, setorista_id_val, 100.00, 'Teste de criação', FALSE);
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM vales WHERE descricao = 'Teste de criação') THEN
      insert_result := 'SUCESSO: Inserção funcionando';
      -- Remover o teste
      DELETE FROM vales WHERE descricao = 'Teste de criação';
    ELSE
      insert_result := 'ERRO: Inserção falhou';
    END IF;
  ELSE
    insert_result := 'AVISO: Não foi possível testar inserção - nenhum setorista encontrado';
  END IF;
  
  RAISE NOTICE '%', insert_result;
END $$;

-- 13. Status final
SELECT 'Configuração concluída - teste a funcionalidade no sistema' as status_final;
