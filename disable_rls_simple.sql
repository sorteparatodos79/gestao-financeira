-- Script SIMPLES para DESABILITAR Row Level Security (RLS)
-- Use esta versão se preferir desabilitar RLS completamente
-- Execute este script no SQL Editor do Supabase

-- DESABILITAR RLS em todas as tabelas
ALTER TABLE public.setoristas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.descontos_extras DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir todas as operações em setoristas" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir todas as operações em despesas" ON public.despesas;
DROP POLICY IF EXISTS "Permitir todas as operações em movimentos_financeiros" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir todas as operações em investimentos" ON public.investimentos;
DROP POLICY IF EXISTS "Permitir todas as operações em descontos_extras" ON public.descontos_extras;
DROP POLICY IF EXISTS "Permitir todas as operações em usuarios" ON public.usuarios;
