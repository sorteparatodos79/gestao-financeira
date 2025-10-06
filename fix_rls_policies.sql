-- Script para corrigir políticas RLS da tabela comissoes_retidas
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar as políticas existentes
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'comissoes_retidas';

-- Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable read access for all users" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable update for users based on email" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON comissoes_retidas;

-- Criar políticas mais permissivas para teste
CREATE POLICY "Enable all operations for authenticated users" ON comissoes_retidas
    FOR ALL USING (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'comissoes_retidas';

-- Teste de inserção (opcional - apenas para verificar)
-- INSERT INTO comissoes_retidas (data, setorista_id, valor, descricao) 
-- VALUES (CURRENT_DATE, (SELECT id FROM setoristas LIMIT 1), 100.00, 'Teste');
