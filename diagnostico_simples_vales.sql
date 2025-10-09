-- Script de diagnóstico simplificado para tabela vales
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 'Tabela vales existe' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vales');

-- 2. Verificar se RLS está habilitado
SELECT 
  CASE 
    WHEN rowsecurity THEN 'RLS habilitado'
    ELSE 'RLS desabilitado'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'vales';

-- 3. Verificar políticas existentes
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN permissive THEN 'Permissiva'
    ELSE 'Restritiva'
  END as tipo_politica
FROM pg_policies 
WHERE tablename = 'vales';

-- 4. Verificar se há setoristas (necessário para foreign key)
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Há ' || COUNT(*) || ' setorista(s) cadastrado(s)'
    ELSE 'ERRO: Nenhum setorista cadastrado'
  END as setoristas_status
FROM setoristas;

-- 5. Verificar usuário atual
SELECT 
  current_user as usuario_atual,
  auth.role() as role_autenticacao;

-- 6. Testar uma consulta simples
SELECT 
  CASE 
    WHEN COUNT(*) >= 0 THEN 'Consulta SELECT funcionando - ' || COUNT(*) || ' registro(s)'
    ELSE 'ERRO na consulta SELECT'
  END as teste_select
FROM vales;

-- 7. Verificar estrutura básica da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'vales'
ORDER BY ordinal_position;
