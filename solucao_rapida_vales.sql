-- Solução rápida para erro 401 na tabela vales
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual
SELECT 'Iniciando correção da tabela vales' as status;

-- 2. Habilitar RLS
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;
SELECT 'RLS habilitado' as status;

-- 3. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir acesso a vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir SELECT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir INSERT em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir UPDATE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Permitir DELETE em vales para usuários autenticados" ON vales;
DROP POLICY IF EXISTS "Acesso total a vales" ON vales;
DROP POLICY IF EXISTS "Acesso total a vales para desenvolvimento" ON vales;
SELECT 'Políticas antigas removidas' as status;

-- 4. Criar política permissiva para resolver o problema
CREATE POLICY "Acesso total a vales" ON vales
  FOR ALL USING (true);
SELECT 'Política permissiva criada' as status;

-- 5. Verificar se há setoristas
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'OK: ' || COUNT(*) || ' setorista(s) encontrado(s)'
    ELSE 'AVISO: Nenhum setorista encontrado'
  END as setoristas_check
FROM setoristas;

-- 6. Testar inserção (se houver setoristas)
DO $$
DECLARE
  setorista_id_val UUID;
  insert_result TEXT;
BEGIN
  -- Verificar se há setoristas
  SELECT id INTO setorista_id_val FROM setoristas LIMIT 1;
  
  IF setorista_id_val IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO vales (data, setorista_id, tipo_vale, valor, descricao, status)
    VALUES (CURRENT_DATE, setorista_id_val, 'Adiantamento', 100.00, 'Teste RLS', 'Pendente');
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM vales WHERE descricao = 'Teste RLS') THEN
      insert_result := 'SUCESSO: Inserção funcionando';
      -- Remover o teste
      DELETE FROM vales WHERE descricao = 'Teste RLS';
    ELSE
      insert_result := 'ERRO: Inserção falhou';
    END IF;
  ELSE
    insert_result := 'AVISO: Não foi possível testar inserção - nenhum setorista encontrado';
  END IF;
  
  RAISE NOTICE '%', insert_result;
END $$;

-- 7. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'vales';

-- 8. Status final
SELECT 'Configuração concluída - teste a funcionalidade no sistema' as status_final;
