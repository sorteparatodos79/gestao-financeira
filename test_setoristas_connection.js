// Script para testar conexão com a tabela setoristas
// Execute com: node test_setoristas_connection.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSetoristasConnection() {
  console.log('🔍 Testando conexão com a tabela setoristas...');
  
  try {
    // Teste 1: Contar setoristas
    console.log('\n1. Contando setoristas...');
    const { count, error: countError } = await supabase
      .from('setoristas')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar setoristas:', countError);
    } else {
      console.log(`✅ Total de setoristas: ${count}`);
    }

    // Teste 2: Buscar todos os setoristas
    console.log('\n2. Buscando todos os setoristas...');
    const { data: setoristas, error: fetchError } = await supabase
      .from('setoristas')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar setoristas:', fetchError);
    } else {
      console.log(`✅ Setoristas encontrados: ${setoristas.length}`);
      setoristas.forEach(setorista => {
        console.log(`   - ${setorista.nome} (${setorista.telefone})`);
      });
    }

    // Teste 3: Inserir um setorista de teste
    console.log('\n3. Testando inserção de setorista...');
    const { data: novoSetorista, error: insertError } = await supabase
      .from('setoristas')
      .insert({
        nome: 'Teste Setorista',
        telefone: '(11) 99999-9999',
        ativo: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir setorista:', insertError);
    } else {
      console.log('✅ Setorista inserido com sucesso:', novoSetorista);
      
      // Remover o setorista de teste
      const { error: deleteError } = await supabase
        .from('setoristas')
        .delete()
        .eq('id', novoSetorista.id);
      
      if (deleteError) {
        console.error('❌ Erro ao remover setorista de teste:', deleteError);
      } else {
        console.log('✅ Setorista de teste removido com sucesso');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSetoristasConnection();
