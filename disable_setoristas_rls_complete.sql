-- Script para desabilitar completamente RLS na tabela setoristas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'setoristas';

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "setoristas_select_policy" ON public.setoristas;
DROP POLICY IF EXISTS "setoristas_insert_policy" ON public.setoristas;
DROP POLICY IF EXISTS "setoristas_update_policy" ON public.setoristas;
DROP POLICY IF EXISTS "setoristas_delete_policy" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON public.setoristas;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON public.setoristas;

-- 3. Desabilitar RLS na tabela setoristas
ALTER TABLE public.setoristas DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'setoristas';

-- 5. Testar se consegue acessar os dados
SELECT COUNT(*) as total_setoristas FROM public.setoristas;

-- 6. Testar inserção
INSERT INTO public.setoristas (nome, telefone) VALUES ('Teste RLS', '(11) 99999-9999');

-- 7. Verificar se foi inserido
SELECT * FROM public.setoristas WHERE nome = 'Teste RLS';

-- 8. Remover o teste
DELETE FROM public.setoristas WHERE nome = 'Teste RLS';
