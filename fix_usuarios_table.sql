-- Script para corrigir a tabela usuarios e resolver duplicatas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar o estado atual da tabela
SELECT 'Estado atual da tabela:' as info;
SELECT id, nome, login, email, role, ativo FROM usuarios ORDER BY created_at;

-- 2. Remover constraint de login único se existir
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_login_key;

-- 3. Remover índice de login se existir
DROP INDEX IF EXISTS idx_usuarios_login;

-- 4. Limpar dados duplicados - manter apenas o primeiro registro de cada login
WITH ranked_users AS (
  SELECT id, login, ROW_NUMBER() OVER (PARTITION BY login ORDER BY created_at) as rn
  FROM usuarios 
  WHERE login IS NOT NULL
)
DELETE FROM usuarios 
WHERE id IN (
  SELECT id FROM ranked_users WHERE rn > 1
);

-- 5. Garantir que todos os usuários tenham login único
UPDATE usuarios 
SET login = CONCAT(COALESCE(login, nome), '_', SUBSTRING(id::text, 1, 8))
WHERE login IS NULL OR login = '';

-- 6. Adicionar constraint de login único
ALTER TABLE usuarios ADD CONSTRAINT usuarios_login_key UNIQUE (login);

-- 7. Criar índice para login
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON public.usuarios USING btree (login);

-- 8. Remover coluna email se existir
ALTER TABLE usuarios DROP COLUMN IF EXISTS email;

-- 9. Inserir usuário admin se não existir
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

-- 10. Verificar resultado final
SELECT 'Estado final da tabela:' as info;
SELECT id, nome, login, role, ativo, created_at FROM usuarios ORDER BY created_at;

-- 11. Testar se a constraint funciona
SELECT 'Teste de constraint:' as info;
SELECT COUNT(*) as total_usuarios, COUNT(DISTINCT login) as logins_unicos 
FROM usuarios;
