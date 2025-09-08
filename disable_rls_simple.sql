-- Script simples para desabilitar RLS na tabela usuarios
-- Execute este script no SQL Editor do Supabase Dashboard

-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT 'RLS desabilitado. Dados da tabela:' as info;
SELECT id, nome, login, role, ativo FROM usuarios;
