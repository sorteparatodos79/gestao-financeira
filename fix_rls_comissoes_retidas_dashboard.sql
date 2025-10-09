-- Script para configurar RLS e corrigir acesso às comissões retidas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT 'Verificando configuração RLS...' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'comissoes_retidas';

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE comissoes_retidas ENABLE ROW LEVEL SECURITY;

-- 3. Verificar políticas existentes
SELECT 'Verificando políticas existentes...' as status;

SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN permissive THEN 'Permissiva'
    ELSE 'Restritiva'
  END as tipo_politica,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'comissoes_retidas';

-- 4. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON comissoes_retidas;
DROP POLICY IF EXISTS "Acesso total a comissoes_retidas" ON comissoes_retidas;

-- 5. Criar política permissiva para resolver o problema
CREATE POLICY "Acesso total a comissoes_retidas" ON comissoes_retidas
  FOR ALL USING (true);

-- 6. Verificar se as políticas foram criadas
SELECT 'Verificando novas políticas...' as status;

SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'comissoes_retidas'
ORDER BY policyname;

-- 7. Verificar dados existentes
SELECT 'Verificando dados existentes...' as status;

SELECT COUNT(*) as total_comissoes FROM comissoes_retidas;

-- 8. Testar inserção de um registro de teste
DO $$
DECLARE
  setorista_id_val UUID;
  insert_result TEXT;
BEGIN
  -- Verificar se há setoristas
  SELECT id INTO setorista_id_val FROM setoristas LIMIT 1;
  
  IF setorista_id_val IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO comissoes_retidas (data, setorista_id, valor, descricao)
    VALUES (CURRENT_DATE, setorista_id_val, 100.00, 'Teste RLS Comissões Retidas');
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM comissoes_retidas WHERE descricao = 'Teste RLS Comissões Retidas') THEN
      insert_result := 'SUCESSO: Inserção funcionando';
      -- Remover o teste
      DELETE FROM comissoes_retidas WHERE descricao = 'Teste RLS Comissões Retidas';
    ELSE
      insert_result := 'ERRO: Inserção falhou';
    END IF;
  ELSE
    insert_result := 'AVISO: Não foi possível testar inserção - nenhum setorista encontrado';
  END IF;
  
  RAISE NOTICE '%', insert_result;
END $$;

-- 9. Testar SELECT
SELECT 'Testando SELECT...' as status;

SELECT COUNT(*) as total_apos_correcao FROM comissoes_retidas;

-- 10. Verificar dados do mês atual
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

-- 11. Status final
SELECT 'Configuração de RLS concluída - teste o dashboard agora!' as status_final;
