-- Script para desabilitar RLS na tabela movimentos_financeiros
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual do RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'movimentos_financeiros';

-- 2. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "movimentos_select_policy" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "movimentos_insert_policy" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "movimentos_update_policy" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "movimentos_delete_policy" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON public.movimentos_financeiros;
DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON public.movimentos_financeiros;

-- 3. Desabilitar RLS na tabela movimentos_financeiros
ALTER TABLE public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'movimentos_financeiros';

-- 5. Testar se consegue acessar os dados
SELECT COUNT(*) as total_movimentos FROM public.movimentos_financeiros;

-- 6. Testar inserção
INSERT INTO public.movimentos_financeiros (data, setorista_id, vendas, comissao, comissao_retida, premios, despesas, valor_liquido) 
SELECT 
    CURRENT_DATE,
    s.id,
    1000.00,
    100.00,
    20.00,
    50.00,
    0.00,
    830.00
FROM public.setoristas s
WHERE s.ativo = true
LIMIT 1;

-- 7. Verificar se foi inserido
SELECT 
    m.id,
    m.data,
    s.nome as setorista_nome,
    m.vendas,
    m.valor_liquido
FROM public.movimentos_financeiros m
JOIN public.setoristas s ON m.setorista_id = s.id
ORDER BY m.created_at DESC
LIMIT 5;

-- 8. Remover o teste (opcional)
-- DELETE FROM public.movimentos_financeiros WHERE vendas = 1000.00;
