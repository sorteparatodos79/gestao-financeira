-- Atualizar usuário administrador com credenciais corretas
UPDATE usuarios 
SET nome = 'admin', email = 'admin@exemplo.com', senha = 'admin123' 
WHERE email = 'admin@sorteouroverde.com' OR email = 'admin@exemplo.com';

-- Se não existir, inserir o usuário correto
INSERT INTO usuarios (nome, email, senha, role, ativo) 
VALUES ('admin', 'admin@exemplo.com', 'admin123', 'admin', true)
ON CONFLICT (email) DO NOTHING;
