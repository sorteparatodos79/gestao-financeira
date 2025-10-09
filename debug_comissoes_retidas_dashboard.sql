-- Script para debugar comissões retidas no dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados existentes
SELECT 'Verificando dados existentes...' as status;

SELECT 
  COUNT(*) as total_comissoes,
  MIN(data) as data_mais_antiga,
  MAX(data) as data_mais_recente
FROM comissoes_retidas;

-- 2. Verificar dados por mês
SELECT 'Verificando dados por mês...' as status;

SELECT 
  EXTRACT(YEAR FROM data) as ano,
  EXTRACT(MONTH FROM data) as mes,
  COUNT(*) as quantidade,
  SUM(valor) as valor_total
FROM comissoes_retidas
GROUP BY EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data)
ORDER BY ano DESC, mes DESC;

-- 3. Verificar dados do mês atual
SELECT 'Verificando dados do mês atual...' as status;

SELECT 
  cr.data,
  s.nome as setorista,
  cr.valor,
  cr.descricao,
  EXTRACT(YEAR FROM cr.data) as ano,
  EXTRACT(MONTH FROM cr.data) as mes
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
WHERE EXTRACT(YEAR FROM cr.data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM cr.data) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY cr.data DESC;

-- 4. Verificar dados dos últimos 3 meses
SELECT 'Verificando dados dos últimos 3 meses...' as status;

SELECT 
  cr.data,
  s.nome as setorista,
  cr.valor,
  cr.descricao,
  EXTRACT(YEAR FROM cr.data) as ano,
  EXTRACT(MONTH FROM cr.data) as mes
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
WHERE cr.data >= CURRENT_DATE - INTERVAL '3 months'
ORDER BY cr.data DESC;

-- 5. Inserir dados de teste para o mês atual se não houver
INSERT INTO comissoes_retidas (data, setorista_id, valor, descricao)
SELECT 
  CURRENT_DATE - INTERVAL '2 days',
  s.id,
  300.00,
  'Teste Dashboard - ' || s.nome
FROM setoristas s
WHERE NOT EXISTS (
  SELECT 1 FROM comissoes_retidas 
  WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
)
LIMIT 2;

-- 6. Verificar se os dados de teste foram inseridos
SELECT 'Verificando dados de teste...' as status;

SELECT 
  cr.data,
  s.nome as setorista,
  cr.valor,
  cr.descricao
FROM comissoes_retidas cr
LEFT JOIN setoristas s ON cr.setorista_id = s.id
WHERE cr.descricao LIKE 'Teste Dashboard%'
ORDER BY cr.data DESC;

-- 7. Verificar dados finais do mês atual
SELECT 'Dados finais do mês atual...' as status;

SELECT 
  COUNT(*) as total_comissoes_mes_atual,
  SUM(valor) as valor_total_mes_atual
FROM comissoes_retidas
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE);

-- 8. Status final
SELECT 'Debug concluído! Verifique se há dados do mês atual.' as status_final;
