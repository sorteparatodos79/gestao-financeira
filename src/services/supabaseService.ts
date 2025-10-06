// Serviço para integração com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtvaamhssndvhlxmxjok.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmFhbWhzc25kdmhseG14am9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDU5MjksImV4cCI6MjA3MjkyMTkyOX0.Vq3sGLCiJjTFC3KGiGfUtYHCV3gba4wmI_GAZ6QWxIA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o Supabase
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          login: string;
          senha: string;
          role: 'admin' | 'user';
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          login: string;
          senha: string;
          role: 'admin' | 'user';
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          login?: string;
          senha?: string;
          role?: 'admin' | 'user';
          ativo?: boolean;
        };
      };
      setoristas: {
        Row: {
          id: string;
          nome: string;
          telefone: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone: string;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          telefone?: string;
          ativo?: boolean;
        };
      };
      despesas: {
        Row: {
          id: string;
          data: string;
          tipo_despesa: string;
          setorista_id: string;
          valor: number;
          descricao?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data: string;
          tipo_despesa: string;
          setorista_id: string;
          valor: number;
          descricao?: string;
        };
        Update: {
          data?: string;
          tipo_despesa?: string;
          setorista_id?: string;
          valor?: number;
          descricao?: string;
        };
      };
      movimentos_financeiros: {
        Row: {
          id: string;
          data: string;
          setorista_id: string;
          vendas: number;
          comissao: number;
          comissao_retida: number;
          premios: number;
          despesas: number;
          valor_liquido: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data: string;
          setorista_id: string;
          vendas?: number;
          comissao?: number;
          comissao_retida?: number;
          premios?: number;
          despesas?: number;
          valor_liquido?: number;
        };
        Update: {
          data?: string;
          setorista_id?: string;
          vendas?: number;
          comissao?: number;
          comissao_retida?: number;
          premios?: number;
          despesas?: number;
          valor_liquido?: number;
        };
      };
      investimentos: {
        Row: {
          id: string;
          data: string;
          setorista_id: string;
          tipo_investimento: string;
          valor: number;
          descricao?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data: string;
          setorista_id: string;
          tipo_investimento: string;
          valor: number;
          descricao?: string;
        };
        Update: {
          data?: string;
          setorista_id?: string;
          tipo_investimento?: string;
          valor?: number;
          descricao?: string;
        };
      };
      descontos_extras: {
        Row: {
          id: string;
          mes_ano: string;
          descricao: string;
          valor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mes_ano: string;
          descricao: string;
          valor: number;
        };
        Update: {
          mes_ano?: string;
          descricao?: string;
          valor?: number;
        };
      };
      comissoes_retidas: {
        Row: {
          id: string;
          data: string;
          setorista_id: string;
          valor: number;
          descricao?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data: string;
          setorista_id: string;
          valor: number;
          descricao?: string;
        };
        Update: {
          data?: string;
          setorista_id?: string;
          valor?: number;
          descricao?: string;
        };
      };
    };
  };
}

// Funções de autenticação
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

// Funções para setoristas
export const setoristasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('setoristas')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('setoristas')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(setorista: Database['public']['Tables']['setoristas']['Insert']) {
    const { data, error } = await supabase
      .from('setoristas')
      .insert(setorista)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, setorista: Database['public']['Tables']['setoristas']['Update']) {
    const { data, error } = await supabase
      .from('setoristas')
      .update(setorista)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('setoristas')
      .update({ ativo: false })
      .eq('id', id);
    return { error };
  }
};

// Funções para despesas
export const despesasService = {
  async getAll() {
    const { data, error } = await supabase
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
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('despesas')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(despesa: Database['public']['Tables']['despesas']['Insert']) {
    const { data, error } = await supabase
      .from('despesas')
      .insert(despesa)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async update(id: string, despesa: Database['public']['Tables']['despesas']['Update']) {
    const { data, error } = await supabase
      .from('despesas')
      .update(despesa)
      .eq('id', id)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funções para movimentos financeiros
export const movimentosService = {
  async getAll() {
    const { data, error } = await supabase
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
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('movimentos_financeiros')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(movimento: Database['public']['Tables']['movimentos_financeiros']['Insert']) {
    const { data, error } = await supabase
      .from('movimentos_financeiros')
      .insert(movimento)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async update(id: string, movimento: Database['public']['Tables']['movimentos_financeiros']['Update']) {
    const { data, error } = await supabase
      .from('movimentos_financeiros')
      .update(movimento)
      .eq('id', id)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('movimentos_financeiros')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funções para investimentos
export const investimentosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('investimentos')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .order('data', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('investimentos')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(investimento: Database['public']['Tables']['investimentos']['Insert']) {
    console.log('Supabase: Tentando criar investimento com dados:', investimento);
    
    const { data, error } = await supabase
      .from('investimentos')
      .insert(investimento)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    
    if (error) {
      console.error('Supabase: Erro ao criar investimento:', error);
    } else {
      console.log('Supabase: Investimento criado com sucesso:', data);
    }
    
    return { data, error };
  },

  async update(id: string, investimento: Database['public']['Tables']['investimentos']['Update']) {
    const { data, error } = await supabase
      .from('investimentos')
      .update(investimento)
      .eq('id', id)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('investimentos')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funções para usuários
export const usuariosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(usuario: Database['public']['Tables']['usuarios']['Insert']) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, usuario: Database['public']['Tables']['usuarios']['Update']) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ ativo: false })
      .eq('id', id);
    return { error };
  }
};

// Funções para descontos extras
export const descontosExtrasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('descontos_extras')
      .select('*')
      .order('mes_ano', { ascending: false })
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getByMesAno(mesAno: string) {
    const { data, error } = await supabase
      .from('descontos_extras')
      .select('*')
      .eq('mes_ano', mesAno)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('descontos_extras')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(desconto: Database['public']['Tables']['descontos_extras']['Insert']) {
    const { data, error } = await supabase
      .from('descontos_extras')
      .insert(desconto)
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, desconto: Database['public']['Tables']['descontos_extras']['Update']) {
    const { data, error } = await supabase
      .from('descontos_extras')
      .update(desconto)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('descontos_extras')
      .delete()
      .eq('id', id);
    return { error };
  },

  async deleteByMesAno(mesAno: string) {
    const { error } = await supabase
      .from('descontos_extras')
      .delete()
      .eq('mes_ano', mesAno);
    return { error };
  }
};

// Funções para comissões retidas
export const comissoesRetidasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('comissoes_retidas')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .order('data', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('comissoes_retidas')
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(comissaoRetida: Database['public']['Tables']['comissoes_retidas']['Insert']) {
    const { data, error } = await supabase
      .from('comissoes_retidas')
      .insert(comissaoRetida)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async update(id: string, comissaoRetida: Database['public']['Tables']['comissoes_retidas']['Update']) {
    const { data, error } = await supabase
      .from('comissoes_retidas')
      .update(comissaoRetida)
      .eq('id', id)
      .select(`
        *,
        setoristas:setorista_id (
          id,
          nome,
          telefone
        )
      `)
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('comissoes_retidas')
      .delete()
      .eq('id', id);
    return { error };
  }
};
