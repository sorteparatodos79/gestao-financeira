-- Script para diagnosticar problemas com comissões retidas no dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Verificando se a tabela comissoes_retidas existe...' as status;

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'comissoes_retidas';

-- 2. Verificar estrutura da tabela
SELECT 'Verificando estrutura da tabela...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'comissoes_retidas'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT 'Verificando dados na tabela...' as status;

SELECT COUNT(*) as total_comissoes_retidas FROM comissoes_retidas;

-- 4. Verificar dados com detalhes
SELECT 'Verificando dados com detalhes...' as status;

SELECT 
  cr.id,
  cr.data,
  cr.valor,
  cr.descricao,
  s.nome as setorista_nome,
  cr.created_at
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
ORDER BY cr.data DESC
LIMIT 10;

-- 5. Verificar RLS (Row Level Security)
SELECT 'Verificando configuração RLS...' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'comissoes_retidas';

-- 6. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;

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

-- 7. Testar inserção de dados de teste
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
    VALUES (CURRENT_DATE, setorista_id_val, 100.00, 'Teste Dashboard - ' || CURRENT_DATE);
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM comissoes_retidas WHERE descricao LIKE 'Teste Dashboard%') THEN
      insert_result := 'SUCESSO: Inserção funcionando';
    ELSE
      insert_result := 'ERRO: Inserção falhou';
    END IF;
  ELSE
    insert_result := 'ERRO: Nenhum setorista encontrado';
  END IF;
  
  RAISE NOTICE '%', insert_result;
END $$;

-- 8. Verificar dados por mês atual
SELECT 'Verificando dados do mês atual...' as status;

SELECT 
  COUNT(*) as comissoes_mes_atual,
  SUM(valor) as total_valor_mes_atual
FROM comissoes_retidas 
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE);

-- 9. Verificar dados por setorista no mês atual
SELECT 'Verificando dados por setorista no mês atual...' as status;

SELECT 
  s.nome as setorista,
  COUNT(cr.id) as quantidade_comissoes,
  SUM(cr.valor) as total_valor
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
WHERE EXTRACT(YEAR FROM cr.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM cr.data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY s.id, s.nome
ORDER BY total_valor DESC;

-- 10. Limpar dados de teste
DELETE FROM comissoes_retidas WHERE descricao LIKE 'Teste Dashboard%';

-- 11. Status final
SELECT 'Diagnóstico concluído!' as status_final;
