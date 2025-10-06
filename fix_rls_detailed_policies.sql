-- Script para corrigir políticas RLS com operações específicas
-- Execute este script no Supabase SQL Editor

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON comissoes_retidas;
DROP POLICY IF EXISTS "Permitir acesso a comissões retidas para usuários autenticados" ON comissoes_retidas;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON comissoes_retidas;

-- Criar políticas específicas para cada operação
-- Política para SELECT (leitura)
CREATE POLICY "Enable read access for authenticated users" ON comissoes_retidas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT (inserção)
CREATE POLICY "Enable insert for authenticated users" ON comissoes_retidas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (atualização)
CREATE POLICY "Enable update for authenticated users" ON comissoes_retidas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE (exclusão)
CREATE POLICY "Enable delete for authenticated users" ON comissoes_retidas
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'comissoes_retidas';

-- Verificar políticas criadas
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'comissoes_retidas';
