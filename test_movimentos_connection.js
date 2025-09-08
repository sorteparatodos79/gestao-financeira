// Script para testar conexão com a tabela movimentos_financeiros
// Execute com: node test_movimentos_connection.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMovimentosConnection() {
  console.log('🔍 Testando conexão com a tabela movimentos_financeiros...');
  
  try {
    // Teste 1: Contar movimentos
    console.log('\n1. Contando movimentos...');
    const { count, error: countError } = await supabase
      .from('movimentos_financeiros')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar movimentos:', countError);
    } else {
      console.log(`✅ Total de movimentos: ${count}`);
    }

    // Teste 2: Buscar todos os movimentos com join
    console.log('\n2. Buscando movimentos com setoristas...');
    const { data: movimentos, error: fetchError } = await supabase
      .from('movimentos_financeiros')
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
      console.error('❌ Erro ao buscar movimentos:', fetchError);
    } else {
      console.log(`✅ Movimentos encontrados: ${movimentos.length}`);
      movimentos.forEach(movimento => {
        console.log(`   - ${movimento.data} | ${movimento.setoristas?.nome || 'N/A'} | R$ ${movimento.valor_liquido}`);
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

    // Teste 4: Inserir um movimento de teste
    console.log('\n4. Testando inserção de movimento...');
    const { data: novoMovimento, error: insertError } = await supabase
      .from('movimentos_financeiros')
      .insert({
        data: new Date().toISOString().split('T')[0],
        setorista_id: setoristaId,
        vendas: 1000.00,
        comissao: 100.00,
        comissao_retida: 20.00,
        premios: 50.00,
        despesas: 0.00,
        valor_liquido: 830.00
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
      console.error('❌ Erro ao inserir movimento:', insertError);
    } else {
      console.log('✅ Movimento inserido com sucesso:', {
        id: novoMovimento.id,
        data: novoMovimento.data,
        setorista: novoMovimento.setoristas?.nome,
        valor_liquido: novoMovimento.valor_liquido
      });
      
      // Remover o movimento de teste
      const { error: deleteError } = await supabase
        .from('movimentos_financeiros')
        .delete()
        .eq('id', novoMovimento.id);
      
      if (deleteError) {
        console.error('❌ Erro ao remover movimento de teste:', deleteError);
      } else {
        console.log('✅ Movimento de teste removido com sucesso');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testMovimentosConnection();
