-- Script para criar usuário de teste no Supabase (nova estrutura)
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, verificar se a tabela usuarios existe
SELECT * FROM usuarios LIMIT 1;

-- Inserir usuário de teste se não existir
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

-- Verificar se o usuário foi criado/atualizado
SELECT * FROM usuarios WHERE login = 'admin';

-- Listar todos os usuários ativos
SELECT id, nome, login, role, ativo, created_at FROM usuarios WHERE ativo = true;
