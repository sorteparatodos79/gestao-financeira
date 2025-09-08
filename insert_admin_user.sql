-- Script para inserir usuário admin na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela existe e está vazia
SELECT 'Verificando tabela usuarios:' as info;
SELECT COUNT(*) as total_registros FROM usuarios;

-- 2. Inserir usuário admin
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

-- 3. Verificar se o usuário foi inserido
SELECT 'Usuário inserido:' as info;
SELECT id, nome, login, role, ativo, created_at FROM usuarios;

-- 4. Testar consulta específica
SELECT 'Teste de login:' as info;
SELECT * FROM usuarios WHERE login = 'admin' AND senha = 'password' AND ativo = true;