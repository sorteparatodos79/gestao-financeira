-- Solução rápida para erro 401 na tabela vales simplificada
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Acesso total a vales" ON vales;

-- 3. Criar política permissiva
CREATE POLICY "Acesso total a vales" ON vales
  FOR ALL USING (true);

-- 4. Testar inserção
INSERT INTO vales (data, setorista_id, valor, descricao, recebido)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  100.00,
  'Teste RLS',
  FALSE
);

-- 5. Verificar se funcionou
SELECT * FROM vales WHERE descricao = 'Teste RLS';

-- 6. Limpar teste
DELETE FROM vales WHERE descricao = 'Teste RLS';

-- 7. Status final
SELECT 'RLS configurado com sucesso!' as status;
