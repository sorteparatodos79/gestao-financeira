-- Script para configurar políticas RLS na tabela vales
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'vales';

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

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

-- 4. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir SELECT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir INSERT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir UPDATE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir DELETE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Acesso total a vales" ON vales;

-- 5. Criar políticas específicas para cada operação
CREATE POLICY "Permitir SELECT em vales para usuários autenticados" ON vales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir INSERT em vales para usuários autenticados" ON vales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir UPDATE em vales para usuários autenticados" ON vales
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir DELETE em vales para usuários autenticados" ON vales
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'vales'
ORDER BY policyname;

-- 7. Testar inserção de um registro de teste
INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
VALUES (
  CURRENT_DATE,
  (SELECT id FROM setoristas LIMIT 1),
  'Adiantamento',
  100.00,
  'Teste de políticas RLS',
  'Pendente'
);

-- 8. Verificar se a inserção funcionou
SELECT 'Teste de inserção realizado com sucesso!' as status;
SELECT * FROM vales WHERE descricao = 'Teste de políticas RLS';

-- 9. Testar SELECT
SELECT COUNT(*) as total_vales FROM vales;

-- 10. Limpar registro de teste
DELETE FROM vales WHERE descricao = 'Teste de políticas RLS';
SELECT 'Registro de teste removido' as status;

-- 11. Verificar usuário atual e permissões
SELECT 
  current_user,
  session_user,
  current_role,
  auth.role() as auth_role;
