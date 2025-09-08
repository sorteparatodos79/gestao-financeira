-- Script para corrigir políticas RLS na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se os dados aparecem agora
SELECT 'Dados após desabilitar RLS:' as info;
SELECT id, nome, login, role, ativo FROM usuarios;

-- 4. Reabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 5. Criar política para permitir leitura de todos os usuários
CREATE POLICY "Permitir leitura de todos os usuários" ON usuarios
FOR SELECT USING (true);

-- 6. Criar política para permitir inserção (se necessário)
CREATE POLICY "Permitir inserção de usuários" ON usuarios
FOR INSERT WITH CHECK (true);

-- 7. Criar política para permitir atualização (se necessário)
CREATE POLICY "Permitir atualização de usuários" ON usuarios
FOR UPDATE USING (true);

-- 8. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 9. Testar novamente
SELECT 'Dados após configurar políticas:' as info;
SELECT id, nome, login, role, ativo FROM usuarios;
