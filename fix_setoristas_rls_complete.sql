-- Script completo para corrigir RLS na tabela setoristas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'setoristas';

-- 2. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON public.setoristas;

-- 3. Habilitar RLS na tabela setoristas
ALTER TABLE public.setoristas ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "setoristas_select_policy" ON public.setoristas
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "setoristas_insert_policy" ON public.setoristas
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "setoristas_update_policy" ON public.setoristas
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "setoristas_delete_policy" ON public.setoristas
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'setoristas';

-- 6. Testar se consegue acessar os dados
SELECT COUNT(*) as total_setoristas FROM public.setoristas;

-- 7. Testar inserção (opcional)
-- INSERT INTO public.setoristas (nome, telefone) VALUES ('Teste', '(11) 99999-9999');
