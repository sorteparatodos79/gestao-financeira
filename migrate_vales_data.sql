-- Script para migrar dados existentes para tabela vales simplificada
-- Execute este script APENAS se quiser preservar os dados existentes

-- 1. Verificar estrutura atual da tabela
SELECT 'Verificando estrutura atual da tabela vales...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vales'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT 'Verificando dados existentes...' as status;
SELECT COUNT(*) as total_vales FROM vales;

-- 3. Criar tabela temporária com dados existentes
CREATE TEMP TABLE vales_backup AS 
SELECT 
  id,
  data,
  setorista_id,
  valor,
  descricao,
  CASE 
    WHEN status = 'Recebido' THEN TRUE
    ELSE FALSE
  END as recebido,
  data_recebimento,
  created_at,
  updated_at
FROM vales;

-- 4. Verificar backup
SELECT 'Backup criado com sucesso!' as status;
SELECT COUNT(*) as vales_no_backup FROM vales_backup;

-- 5. Remover tabela original
DROP TABLE vales CASCADE;

-- 6. Criar nova tabela simplificada
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

-- 7. Restaurar dados do backup
INSERT INTO vales (id, data, setorista_id, valor, descricao, recebido, data_recebimento, created_at, updated_at)
SELECT id, data, setorista_id, valor, descricao, recebido, data_recebimento, created_at, updated_at
FROM vales_backup;

-- 8. Verificar restauração
SELECT 'Dados restaurados com sucesso!' as status;
SELECT COUNT(*) as vales_restaurados FROM vales;

-- 9. Criar índices
CREATE INDEX idx_vales_data ON vales(data);
CREATE INDEX idx_vales_setorista_id ON vales(setorista_id);
CREATE INDEX idx_vales_recebido ON vales(recebido);

-- 10. Configurar RLS
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso a vales para usuários autenticados" ON vales
  FOR ALL USING (auth.role() = 'authenticated');

-- 11. Criar trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vales_updated_at 
  BEFORE UPDATE ON vales 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Verificar migração
SELECT 'Migração concluída com sucesso!' as status;
SELECT 
  COUNT(*) as total_vales,
  COUNT(CASE WHEN recebido THEN 1 END) as vales_recebidos,
  COUNT(CASE WHEN NOT recebido THEN 1 END) as vales_pendentes
FROM vales;

-- 13. Limpar tabela temporária
DROP TABLE vales_backup;
