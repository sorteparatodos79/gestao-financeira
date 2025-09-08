-- Script para corrigir RLS na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar políticas RLS existentes
SELECT 'Políticas RLS existentes:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir leitura de todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON usuarios;

-- 3. Criar política para permitir leitura de todos os usuários
CREATE POLICY "Permitir leitura de todos os usuários" ON usuarios
FOR SELECT USING (true);

-- 4. Criar política para permitir inserção
CREATE POLICY "Permitir inserção de usuários" ON usuarios
FOR INSERT WITH CHECK (true);

-- 5. Criar política para permitir atualização
CREATE POLICY "Permitir atualização de usuários" ON usuarios
FOR UPDATE USING (true);

-- 6. Verificar se as políticas foram criadas
SELECT 'Políticas RLS após correção:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 7. Testar consulta
SELECT 'Teste de consulta após correção:' as info;
SELECT id, nome, login, role, ativo FROM usuarios;
