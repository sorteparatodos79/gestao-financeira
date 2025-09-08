-- Script para desabilitar RLS na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- Desabilitar Row Level Security na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT 'RLS desabilitado. Dados da tabela usuarios:' as info;
SELECT id, nome, login, role, ativo, created_at FROM usuarios ORDER BY created_at;
