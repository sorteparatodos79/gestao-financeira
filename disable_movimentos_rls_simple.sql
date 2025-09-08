-- Script simples para desabilitar RLS na tabela movimentos_financeiros
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS na tabela movimentos_financeiros
ALTER TABLE public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'movimentos_financeiros';
