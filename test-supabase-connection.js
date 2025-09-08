// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

// Testar conexão
async function testConnection() {
  try {
    console.log('\n📊 Testando busca de usuários...');
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return;
    }
    
    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Usuários encontrados:', usuarios?.length || 0);
    console.log('👥 Lista de usuários:', usuarios);
    
    // Testar login específico
    const foundUser = usuarios?.find(
      u => u.login === 'admin' && u.senha === 'password' && u.ativo
    );
    
    if (foundUser) {
      console.log('✅ Usuário admin encontrado:', foundUser);
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testConnection();
