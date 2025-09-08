-- Script para remover funcionalidades de despesas fixas do banco
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existe alguma coluna relacionada a despesas fixas na tabela setoristas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'setoristas' 
AND table_schema = 'public';

-- 2. Se existir coluna despesas_fixas, removê-la
-- ALTER TABLE public.setoristas DROP COLUMN IF EXISTS despesas_fixas;

-- 3. Verificar se existe tabela de despesas_fixas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%despesa%';

-- 4. Se existir tabela despesas_fixas, removê-la
-- DROP TABLE IF EXISTS public.despesas_fixas CASCADE;

-- 5. Verificar estrutura atual da tabela setoristas
\d public.setoristas;
