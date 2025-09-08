// Teste específico para verificar diferentes consultas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log('🔍 Testando diferentes consultas...\n');
  
  // Teste 1: Consulta simples
  console.log('1️⃣ Teste: SELECT * FROM usuarios');
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Sucesso:', data?.length || 0, 'registros');
      console.log('📊 Dados:', data);
    }
  } catch (err) {
    console.error('❌ Exceção:', err);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Consulta com filtro
  console.log('2️⃣ Teste: SELECT * FROM usuarios WHERE login = "admin"');
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('login', 'admin');
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Sucesso:', data?.length || 0, 'registros');
      console.log('📊 Dados:', data);
    }
  } catch (err) {
    console.error('❌ Exceção:', err);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Consulta com count
  console.log('3️⃣ Teste: SELECT COUNT(*) FROM usuarios');
  try {
    const { count, error } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Sucesso:', count, 'registros');
    }
  } catch (err) {
    console.error('❌ Exceção:', err);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 4: Verificar outras tabelas
  console.log('4️⃣ Teste: Verificar outras tabelas');
  try {
    const { data, error } = await supabase
      .from('setoristas')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Sucesso na tabela setoristas:', data?.length || 0, 'registros');
    }
  } catch (err) {
    console.error('❌ Exceção:', err);
  }
}

testQueries();
