-- Script para configurar Row Level Security (RLS) nas tabelas do sistema
-- Execute este script no SQL Editor do Supabase

-- Habilitar RLS em todas as tabelas necessárias
ALTER TABLE public.setoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descontos_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para SETORISTAS
CREATE POLICY "Permitir todas as operações em setoristas" ON public.setoristas
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para DESPESAS  
CREATE POLICY "Permitir todas as operações em despesas" ON public.despesas
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para MOVIMENTOS_FINANCEIROS
CREATE POLICY "Permitir todas as operações em movimentos_financeiros" ON public.movimentos_financeiros
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para INVESTIMENTOS <-- PRINCIPAL PROBLEMA
CREATE POLICY "Permitir todas as operações em investimentos" ON public.investimentos
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para DESCONTOS_EXTRAS
CREATE POLICY "Permitir todas as operações em descontos_extras" ON public.descontos_extras
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para USUARIOS
CREATE POLICY "Permitir todas as operações em usuarios" ON public.usuarios
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE scheMAName = 'public'
ORDER BY tablename, policyname;
