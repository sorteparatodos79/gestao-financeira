-- Script para desabilitar RLS na tabela despesas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'despesas';

-- 2. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "despesas_select_policy" ON public.despesas;
DROP POLICY IF EXISTS "despesas_insert_policy" ON public.despesas;
DROP POLICY IF EXISTS "despesas_update_policy" ON public.despesas;
DROP POLICY IF EXISTS "despesas_delete_policy" ON public.despesas;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.despesas;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON public.despesas;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON public.despesas;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON public.despesas;

-- 3. Desabilitar RLS na tabela despesas
ALTER TABLE public.despesas DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'despesas';

-- 5. Testar se consegue acessar os dados
SELECT COUNT(*) as total_despesas FROM public.despesas;

-- 6. Testar inserção
INSERT INTO public.despesas (data, setorista_id, tipo_despesa, valor, descricao) 
SELECT 
    CURRENT_DATE,
    s.id,
    'Teste',
    100.00,
    'Despesa de teste'
FROM public.setoristas s
WHERE s.ativo = true
LIMIT 1;

-- 7. Verificar se foi inserido
SELECT 
    d.id,
    d.data,
    s.nome as setorista_nome,
    d.tipo_despesa,
    d.valor,
    d.descricao
FROM public.despesas d
JOIN public.setoristas s ON d.setorista_id = s.id
ORDER BY d.created_at DESC
LIMIT 5;

-- 8. Remover o teste (opcional)
-- DELETE FROM public.despesas WHERE tipo_despesa = 'Teste';
