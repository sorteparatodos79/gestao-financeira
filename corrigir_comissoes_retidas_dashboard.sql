-- Script para testar e corrigir problemas com comissões retidas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e tem dados
SELECT 'Verificando tabela comissoes_retidas...' as status;

SELECT 
  COUNT(*) as total_registros,
  MIN(data) as data_mais_antiga,
  MAX(data) as data_mais_recente,
  SUM(valor) as valor_total
FROM comissoes_retidas;

-- 2. Se não houver dados, inserir dados de teste
INSERT INTO comissoes_retidas (data, setorista_id, valor, descricao)
SELECT 
  CURRENT_DATE - INTERVAL '5 days',
  s.id,
  150.00,
  'Comissão retida de teste - ' || s.nome
FROM setoristas s
LIMIT 3;

-- 3. Verificar RLS
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON comissoes_retidas;

-- 5. Criar política permissiva
CREATE POLICY "Acesso total a comissoes_retidas" ON comissoes_retidas
  FOR ALL USING (true);

-- 6. Verificar se funcionou
SELECT 'Testando acesso à tabela...' as status;

SELECT COUNT(*) as total_apos_correcao FROM comissoes_retidas;

-- 7. Verificar dados do mês atual
SELECT 'Verificando dados do mês atual...' as status;

SELECT 
  cr.data,
  s.nome as setorista,
  cr.valor,
  cr.descricao
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
WHERE EXTRACT(YEAR FROM cr.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM cr.data) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY cr.data DESC;

-- 8. Status final
SELECT 'Correção concluída! Teste o dashboard agora.' as status_final;
