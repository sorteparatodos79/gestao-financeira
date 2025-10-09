-- Script para verificar e corrigir problemas de permissão na tabela vales
-- Execute este script APÓS executar o create_vales_table.sql

-- 1. Verificar se a tabela existe
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'vales';

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'vales';

-- 3. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'vales';

-- 4. Se necessário, recriar a política com permissões mais específicas
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;

-- Política mais específica para operações CRUD
CREATE POLICY "Permitir SELECT em vales para usuários autenticados" ON vales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir INSERT em vales para usuários autenticados" ON vales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir UPDATE em vales para usuários autenticados" ON vales
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir DELETE em vales para usuários autenticados" ON vales
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Verificar se o usuário atual tem permissões
SELECT 
  current_user,
  session_user,
  current_role;

-- 6. Testar inserção de um registro de teste (opcional)
-- INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
-- VALUES (
--   CURRENT_DATE,
--   (SELECT id FROM setoristas LIMIT 1),
--   'Adiantamento',
--   100.00,
--   'Teste de inserção',
--   'Pendente'
-- );

-- 7. Verificar se a inserção funcionou
-- SELECT * FROM vales ORDER BY created_at DESC LIMIT 5;

-- 8. Limpar registro de teste (se foi inserido)
-- DELETE FROM vales WHERE descricao = 'Teste de inserção';
