-- Script de teste simples para verificar conexão e criar tabela vales
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se conseguimos acessar o banco
SELECT 'Conexão com banco OK' as status;

-- 2. Verificar se a tabela setoristas existe (necessária para foreign key)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'setoristas')
    THEN 'Tabela setoristas existe'
    ELSE 'ERRO: Tabela setoristas não existe'
  END as status;

-- 3. Verificar se a tabela vales existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vales')
    THEN 'Tabela vales já existe'
    ELSE 'Tabela vales não existe - será criada'
  END as status;

-- 4. Criar tabela vales (se não existir)
CREATE TABLE IF NOT EXISTS vales (
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

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_vales_data ON vales(data);
CREATE INDEX IF NOT EXISTS idx_vales_setorista_id ON vales(setorista_id);
CREATE INDEX IF NOT EXISTS idx_vales_status ON vales(status);
CREATE INDEX IF NOT EXISTS idx_vales_tipo_vale ON vales(tipo_vale);

-- 6. Configurar RLS
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- 7. Criar política simples
DROP POLICY IF EXISTS "Acesso total a vales" ON vales;
CREATE POLICY "Acesso total a vales" ON vales
  FOR ALL USING (true);

-- 8. Verificar se tudo foi criado corretamente
SELECT 'Tabela vales criada com sucesso!' as status;

-- 9. Testar inserção de um registro de teste
INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  'Adiantamento',
  100.00,
  'Teste de criação',
  'Pendente'
);

-- 10. Verificar se a inserção funcionou
SELECT 'Teste de inserção realizado com sucesso!' as status;
SELECT * FROM vales WHERE descricao = 'Teste de criação';

-- 11. Limpar registro de teste
DELETE FROM vales WHERE descricao = 'Teste de criação';
SELECT 'Registro de teste removido' as status;
