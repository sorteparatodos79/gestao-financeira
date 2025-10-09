-- Script de diagnóstico completo para tabela vales
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e suas propriedades
SELECT 
  table_name,
  table_type,
  is_insertable_into,
  is_typed
FROM information_schema.tables 
WHERE table_name = 'vales';

-- 2. Verificar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vales'
ORDER BY ordinal_position;

-- 3. Verificar constraints
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'vales';

-- 4. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'vales';

-- 5. Verificar RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'vales';

-- 6. Verificar políticas existentes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'vales';

-- 7. Verificar permissões do usuário atual
SELECT 
  current_user,
  session_user,
  current_role,
  current_database();

-- 8. Verificar se auth.role() funciona
SELECT auth.role() as auth_role;

-- 9. Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM vales;

-- 10. Verificar se há setoristas (necessário para foreign key)
SELECT COUNT(*) as total_setoristas FROM setoristas;

-- 11. Testar uma consulta simples
SELECT 
  id,
  data,
  tipo_vale,
  valor,
  status
FROM vales 
LIMIT 5;

-- 12. Verificar logs de erro (se possível)
-- SELECT * FROM pg_stat_user_tables WHERE relname = 'vales';
