-- Script para configurar políticas RLS na tabela vales simplificada
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT 
  CASE 
    WHEN rowsecurity THEN 'RLS habilitado'
    ELSE 'RLS desabilitado'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'vales';

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;

-- 3. Verificar políticas existentes
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN permissive THEN 'Permissiva'
    ELSE 'Restritiva'
  END as tipo_politica
FROM pg_policies 
WHERE tablename = 'vales';

-- 4. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir SELECT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir INSERT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir UPDATE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir DELETE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Acesso total a vales" ON vales;

-- 5. Criar política permissiva para resolver o problema
CREATE POLICY "Acesso total a vales para usuários autenticados" ON vales
  FOR ALL USING (auth.role() = 'authenticated');

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

-- 7. Verificar usuário atual e permissões
SELECT 
  current_user as usuario_atual,
  auth.role() as role_autenticacao;

-- 8. Testar inserção de um registro de teste
DO $$
DECLARE
  setorista_id_val UUID;
  insert_result TEXT;
BEGIN
  -- Verificar se há setoristas
  SELECT id INTO setorista_id_val FROM setoristas LIMIT 1;
  
  IF setorista_id_val IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO vales (data, setorista_id, valor, descricao, recebido)
    VALUES (CURRENT_DATE, setorista_id_val, 100.00, 'Teste RLS Simplificado', FALSE);
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM vales WHERE descricao = 'Teste RLS Simplificado') THEN
      insert_result := 'SUCESSO: Inserção funcionando';
      -- Remover o teste
      DELETE FROM vales WHERE descricao = 'Teste RLS Simplificado';
    ELSE
      insert_result := 'ERRO: Inserção falhou';
    END IF;
  ELSE
    insert_result := 'AVISO: Não foi possível testar inserção - nenhum setorista encontrado';
  END IF;
  
  RAISE NOTICE '%', insert_result;
END $$;

-- 9. Testar SELECT
SELECT COUNT(*) as total_vales FROM vales;

-- 10. Status final
SELECT 'Configuração de RLS concluída - teste a funcionalidade no sistema' as status_final;
