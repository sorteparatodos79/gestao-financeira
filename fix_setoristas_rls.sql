-- Script para configurar RLS na tabela setoristas
-- Execute este script no SQL Editor do Supabase

-- Verificar se RLS está habilitado na tabela setoristas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'setoristas';

-- Habilitar RLS na tabela setoristas (se não estiver habilitado)
ALTER TABLE public.setoristas ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT para usuários autenticados
CREATE POLICY "Permitir SELECT para usuários autenticados" ON public.setoristas
    FOR SELECT
    TO authenticated
    USING (true);

-- Criar política para permitir INSERT para usuários autenticados
CREATE POLICY "Permitir INSERT para usuários autenticados" ON public.setoristas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Criar política para permitir UPDATE para usuários autenticados
CREATE POLICY "Permitir UPDATE para usuários autenticados" ON public.setoristas
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Criar política para permitir DELETE para usuários autenticados
CREATE POLICY "Permitir DELETE para usuários autenticados" ON public.setoristas
    FOR DELETE
    TO authenticated
    USING (true);

-- Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'setoristas';

-- Testar se consegue acessar os dados
SELECT COUNT(*) as total_setoristas FROM public.setoristas;
