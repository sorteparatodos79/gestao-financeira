// Script para testar os dados do dashboard
// Execute com: node test_dashboard_data.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardData() {
  console.log('🔍 Testando dados do dashboard...');
  
  try {
    // 1. Buscar setoristas
    console.log('\n1. Buscando setoristas...');
    const { data: setoristas, error: setoristasError } = await supabase
      .from('setoristas')
      .select('id, nome, telefone')
      .eq('ativo', true);
    
    if (setoristasError) {
      console.error('❌ Erro ao buscar setoristas:', setoristasError);
      return;
    }
    
    console.log(`✅ Setoristas encontrados: ${setoristas.length}`);
    setoristas.forEach(s => console.log(`   - ${s.nome} (${s.id})`));

    // 2. Buscar movimentos financeiros
    console.log('\n2. Buscando movimentos financeiros...');
    const { data: movimentos, error: movimentosError } = await supabase
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
    
    if (movimentosError) {
      console.error('❌ Erro ao buscar movimentos:', movimentosError);
      return;
    }
    
    console.log(`✅ Movimentos encontrados: ${movimentos.length}`);
    movimentos.forEach(m => {
      console.log(`   - ${m.data} | ${m.setoristas?.nome || 'N/A'} | Vendas: R$ ${m.vendas} | Líquido: R$ ${m.valor_liquido}`);
    });

    // 3. Simular cálculo do resumo por setorista
    console.log('\n3. Calculando resumo por setorista...');
    const resumoSetorista = {};
    
    // Inicializar com setoristas
    setoristas.forEach(setorista => {
      resumoSetorista[setorista.id] = {
        id: setorista.id,
        nome: setorista.nome,
        vendas: 0,
        comissao: 0,
        comissaoRetida: 0,
        premios: 0,
        despesas: 0,
        valorLiquido: 0
      };
    });
    
    // Processar movimentos
    movimentos.forEach(movimento => {
      if (!resumoSetorista[movimento.setorista_id]) {
        console.log(`⚠️  Movimento com setorista_id não encontrado: ${movimento.setorista_id}`);
        return;
      }
      
      resumoSetorista[movimento.setorista_id].vendas += movimento.vendas || 0;
      resumoSetorista[movimento.setorista_id].comissao += movimento.comissao || 0;
      resumoSetorista[movimento.setorista_id].comissaoRetida += movimento.comissao_retida || 0;
      resumoSetorista[movimento.setorista_id].premios += movimento.premios || 0;
      resumoSetorista[movimento.setorista_id].valorLiquido += movimento.valor_liquido || 0;
    });
    
    console.log('\n📊 Resumo por setorista:');
    Object.values(resumoSetorista).forEach(resumo => {
      console.log(`   ${resumo.nome}:`);
      console.log(`     - Vendas: R$ ${resumo.vendas.toFixed(2)}`);
      console.log(`     - Comissão: R$ ${resumo.comissao.toFixed(2)}`);
      console.log(`     - Prêmios: R$ ${resumo.premios.toFixed(2)}`);
      console.log(`     - Valor Líquido: R$ ${resumo.valorLiquido.toFixed(2)}`);
      console.log('');
    });

    // 4. Verificar se há movimentos sem setorista válido
    console.log('\n4. Verificando movimentos órfãos...');
    const movimentosOrfaos = movimentos.filter(m => !setoristas.find(s => s.id === m.setorista_id));
    if (movimentosOrfaos.length > 0) {
      console.log(`⚠️  Movimentos órfãos encontrados: ${movimentosOrfaos.length}`);
      movimentosOrfaos.forEach(m => {
        console.log(`   - ID: ${m.id}, Setorista ID: ${m.setorista_id}, Data: ${m.data}`);
      });
    } else {
      console.log('✅ Nenhum movimento órfão encontrado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDashboardData();
