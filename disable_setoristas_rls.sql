-- Script para desabilitar RLS na tabela setoristas temporariamente
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS na tabela setoristas
ALTER TABLE public.setoristas DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'setoristas';

-- Testar se consegue acessar os dados
SELECT COUNT(*) as total_setoristas FROM public.setoristas;
