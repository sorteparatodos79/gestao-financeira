-- Script para debugar a estrutura da tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela existe
SELECT 'Tabelas existentes:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'usuarios';

-- 2. Verificar estrutura da tabela
SELECT 'Estrutura da tabela usuarios:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'Status do RLS:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 4. Contar registros na tabela
SELECT 'Contagem de registros:' as info;
SELECT COUNT(*) as total_registros FROM usuarios;

-- 5. Listar todos os registros (sem filtros)
SELECT 'Todos os registros:' as info;
SELECT * FROM usuarios;

-- 6. Verificar se há dados na tabela auth.users (usuários do Supabase Auth)
SELECT 'Usuários na tabela auth.users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;
