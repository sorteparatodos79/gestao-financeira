-- Script para modificar a tabela usuarios
-- Remove o campo email e adiciona campo login
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS usuarios_backup AS 
SELECT * FROM usuarios;

-- 2. Remover a constraint de email único
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;

-- 3. Remover o índice do email
DROP INDEX IF EXISTS idx_usuarios_email;

-- 4. Adicionar coluna login
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS login character varying(255);

-- 5. Atualizar a coluna login com o valor do nome (temporariamente)
UPDATE usuarios SET login = nome WHERE login IS NULL;

-- 6. Verificar se há duplicatas e corrigir
-- Primeiro, identificar duplicatas
WITH duplicates AS (
  SELECT login, COUNT(*) as count
  FROM usuarios 
  WHERE login IS NOT NULL
  GROUP BY login 
  HAVING COUNT(*) > 1
)
UPDATE usuarios 
SET login = CONCAT(login, '_', id::text)
WHERE login IN (SELECT login FROM duplicates)
AND id NOT IN (
  SELECT MIN(id) 
  FROM usuarios 
  WHERE login IN (SELECT login FROM duplicates)
  GROUP BY login
);

-- 7. Tornar a coluna login obrigatória
ALTER TABLE usuarios ALTER COLUMN login SET NOT NULL;

-- 8. Adicionar constraint de login único
ALTER TABLE usuarios ADD CONSTRAINT usuarios_login_key UNIQUE (login);

-- 8. Criar índice para login
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON public.usuarios USING btree (login);

-- 9. Remover a coluna email
ALTER TABLE usuarios DROP COLUMN IF EXISTS email;

-- 10. Inserir usuário de teste com a nova estrutura
INSERT INTO usuarios (id, nome, login, senha, role, ativo, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  'Administrador',
  'admin', 
  'password', 
  'admin', 
  true,
  NOW(),
  NOW()
)
ON CONFLICT (login) DO UPDATE SET
  nome = EXCLUDED.nome,
  senha = EXCLUDED.senha,
  role = EXCLUDED.role,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 11. Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 12. Listar todos os usuários
SELECT id, nome, login, role, ativo, created_at FROM usuarios WHERE ativo = true;
