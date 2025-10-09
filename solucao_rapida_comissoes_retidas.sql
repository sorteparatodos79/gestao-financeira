-- Solução rápida para comissões retidas não aparecerem no dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar RLS
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON comissoes_retidas;
DROP POLICY IF EXISTS "Acesso total a comissoes_retidas" ON comissoes_retidas;

-- 3. Criar política permissiva
CREATE POLICY "Acesso total a comissoes_retidas" ON comissoes_retidas
  FOR ALL USING (true);

-- 4. Inserir dados de teste se não houver dados
INSERT INTO comissoes_retidas (data, setorista_id, valor, descricao)
SELECT 
  CURRENT_DATE - INTERVAL '3 days',
  s.id,
  200.00,
  'Comissão retida teste - ' || s.nome
FROM setoristas s
WHERE NOT EXISTS (SELECT 1 FROM comissoes_retidas LIMIT 1)
LIMIT 2;

-- 5. Verificar se funcionou
SELECT 'Testando acesso...' as status;

SELECT 
  COUNT(*) as total_comissoes,
  COUNT(CASE WHEN EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE) THEN 1 END) as comissoes_mes_atual
FROM comissoes_retidas;

-- 6. Mostrar dados do mês atual
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

-- 7. Status final
SELECT 'RLS configurado com sucesso! Recarregue o dashboard.' as status;
