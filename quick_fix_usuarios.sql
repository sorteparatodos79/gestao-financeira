-- Script rápido para corrigir duplicatas na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover constraint de login único
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_login_key;

-- 2. Remover índice de login
DROP INDEX IF EXISTS idx_usuarios_login;

-- 3. Deletar todos os usuários existentes (cuidado!)
DELETE FROM usuarios;

-- 4. Remover coluna email se existir
ALTER TABLE usuarios DROP COLUMN IF EXISTS email;

-- 5. Garantir que a coluna login existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS login character varying(255);

-- 6. Tornar login obrigatório
ALTER TABLE usuarios ALTER COLUMN login SET NOT NULL;

-- 7. Adicionar constraint de login único
ALTER TABLE usuarios ADD CONSTRAINT usuarios_login_key UNIQUE (login);

-- 8. Criar índice para login
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON public.usuarios USING btree (login);

-- 9. Inserir usuário admin
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
);

-- 10. Verificar resultado
SELECT id, nome, login, role, ativo FROM usuarios;
