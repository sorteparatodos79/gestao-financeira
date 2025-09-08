// Script para testar conexão com a tabela despesas
// Execute com: node test_despesas_connection.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDespesasConnection() {
  console.log('🔍 Testando conexão com a tabela despesas...');
  
  try {
    // Teste 1: Contar despesas
    console.log('\n1. Contando despesas...');
    const { count, error: countError } = await supabase
      .from('despesas')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar despesas:', countError);
    } else {
      console.log(`✅ Total de despesas: ${count}`);
    }

    // Teste 2: Buscar todas as despesas com join
    console.log('\n2. Buscando despesas com setoristas...');
    const { data: despesas, error: fetchError } = await supabase
      .from('despesas')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .order('data', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Erro ao buscar despesas:', fetchError);
    } else {
      console.log(`✅ Despesas encontradas: ${despesas.length}`);
      despesas.forEach(despesa => {
        console.log(`   - ${despesa.data} | ${despesa.setoristas?.nome || 'N/A'} | ${despesa.tipo_despesa} | R$ ${despesa.valor}`);
      });
    }

    // Teste 3: Buscar setoristas para usar no teste de inserção
    console.log('\n3. Buscando setoristas...');
    const { data: setoristas, error: setoristasError } = await supabase
      .from('setoristas')
      .select('id, nome')
      .eq('ativo', true)
      .limit(1);
    
    if (setoristasError) {
      console.error('❌ Erro ao buscar setoristas:', setoristasError);
      return;
    }

    if (setoristas.length === 0) {
      console.log('❌ Nenhum setorista encontrado. Crie um setorista primeiro.');
      return;
    }

    const setoristaId = setoristas[0].id;
    console.log(`✅ Usando setorista: ${setoristas[0].nome} (${setoristaId})`);

    // Teste 4: Inserir uma despesa de teste
    console.log('\n4. Testando inserção de despesa...');
    const { data: novaDespesa, error: insertError } = await supabase
      .from('despesas')
      .insert({
        data: new Date().toISOString().split('T')[0],
        setorista_id: setoristaId,
        tipo_despesa: 'Teste',
        valor: 100.00,
        descricao: 'Despesa de teste'
      })
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir despesa:', insertError);
    } else {
      console.log('✅ Despesa inserida com sucesso:', {
        id: novaDespesa.id,
        data: novaDespesa.data,
        setorista: novaDespesa.setoristas?.nome,
        tipo: novaDespesa.tipo_despesa,
        valor: novaDespesa.valor
      });
      
      // Remover a despesa de teste
      const { error: deleteError } = await supabase
        .from('despesas')
        .delete()
        .eq('id', novaDespesa.id);
      
      if (deleteError) {
        console.error('❌ Erro ao remover despesa de teste:', deleteError);
      } else {
        console.log('✅ Despesa de teste removida com sucesso');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDespesasConnection();
