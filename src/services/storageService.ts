// Serviço de armazenamento usando Supabase
import { Despesa, Investimento, MovimentoFinanceiro, Setorista, Usuario } from "@/types/models";
import { 
  setoristasService, 
  despesasService, 
  movimentosService, 
  investimentosService,
  usuariosService 
} from './supabaseService';

// Funções para Setoristas
export const getSetoristas = async (): Promise<Setorista[]> => {
  try {
    const { data, error } = await setoristasService.getAll();
    if (error) throw error;
    
    return data?.map(setorista => ({
      id: setorista.id,
      nome: setorista.nome,
      telefone: setorista.telefone,
      despesasFixas: [] // Será implementado separadamente
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar setoristas:', error);
    return [];
  }
};

export const addSetorista = async (setorista: Omit<Setorista, 'id'>): Promise<Setorista> => {
  try {
    const { data, error } = await setoristasService.create({
      nome: setorista.nome,
      telefone: setorista.telefone,
      ativo: true
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      telefone: data.telefone,
      despesasFixas: []
    };
  } catch (error) {
    console.error('Erro ao criar setorista:', error);
    throw error;
  }
};

export const updateSetorista = async (setorista: Setorista): Promise<Setorista> => {
  try {
    const { data, error } = await setoristasService.update(setorista.id, {
      nome: setorista.nome,
      telefone: setorista.telefone,
      ativo: true
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      telefone: data.telefone,
      despesasFixas: setorista.despesasFixas || []
    };
  } catch (error) {
    console.error('Erro ao atualizar setorista:', error);
    throw error;
  }
};

export const deleteSetorista = async (id: string): Promise<void> => {
  try {
    const { error } = await setoristasService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar setorista:', error);
    throw error;
  }
};

// Funções para Despesas
export const getDespesas = async (): Promise<Despesa[]> => {
  try {
    const { data, error } = await despesasService.getAll();
    if (error) throw error;
    
    return data?.map(despesa => ({
      id: despesa.id,
      data: new Date(despesa.data),
      tipoDespesa: despesa.tipo_despesa as any,
      setoristaId: despesa.setorista_id,
      setorista: despesa.setoristas ? {
        id: despesa.setoristas.id,
        nome: despesa.setoristas.nome,
        telefone: despesa.setoristas.telefone
      } : undefined,
      valor: despesa.valor,
      descricao: despesa.descricao
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return [];
  }
};

export const addDespesa = async (despesa: Omit<Despesa, 'id'>): Promise<Despesa> => {
  try {
    const { data, error } = await despesasService.create({
      data: despesa.data.toISOString().split('T')[0],
      tipo_despesa: despesa.tipoDespesa,
      setorista_id: despesa.setoristaId,
      valor: despesa.valor,
      descricao: despesa.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      tipoDespesa: data.tipo_despesa as any,
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    throw error;
  }
};

export const updateDespesa = async (despesa: Despesa): Promise<Despesa> => {
  try {
    const { data, error } = await despesasService.update(despesa.id, {
      data: despesa.data.toISOString().split('T')[0],
      tipo_despesa: despesa.tipoDespesa,
      setorista_id: despesa.setoristaId,
      valor: despesa.valor,
      descricao: despesa.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      tipoDespesa: data.tipo_despesa as any,
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
};

export const deleteDespesa = async (id: string): Promise<void> => {
  try {
    const { error } = await despesasService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    throw error;
  }
};

// Funções para Movimentos Financeiros
export const getMovimentos = async (): Promise<MovimentoFinanceiro[]> => {
  try {
    const { data, error } = await movimentosService.getAll();
    if (error) throw error;
    
    return data?.map(movimento => ({
      id: movimento.id,
      data: new Date(movimento.data),
      setoristaId: movimento.setorista_id,
      setorista: movimento.setoristas ? {
        id: movimento.setoristas.id,
        nome: movimento.setoristas.nome,
        telefone: movimento.setoristas.telefone
      } : undefined,
      vendas: movimento.vendas,
      comissao: movimento.comissao,
      comissaoRetida: movimento.comissao_retida,
      premios: movimento.premios,
      despesas: movimento.despesas,
      valorLiquido: movimento.valor_liquido
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar movimentos:', error);
    return [];
  }
};

export const addMovimento = async (movimento: Omit<MovimentoFinanceiro, 'id'>): Promise<MovimentoFinanceiro> => {
  try {
    const { data, error } = await movimentosService.create({
      data: movimento.data.toISOString().split('T')[0],
      setorista_id: movimento.setoristaId,
      vendas: movimento.vendas,
      comissao: movimento.comissao,
      comissao_retida: movimento.comissaoRetida,
      premios: movimento.premios,
      despesas: movimento.despesas,
      valor_liquido: movimento.valorLiquido
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      vendas: data.vendas,
      comissao: data.comissao,
      comissaoRetida: data.comissao_retida,
      premios: data.premios,
      despesas: data.despesas,
      valorLiquido: data.valor_liquido
    };
  } catch (error) {
    console.error('Erro ao criar movimento:', error);
    throw error;
  }
};

export const updateMovimento = async (movimento: MovimentoFinanceiro): Promise<MovimentoFinanceiro> => {
  try {
    const { data, error } = await movimentosService.update(movimento.id, {
      data: movimento.data.toISOString().split('T')[0],
      setorista_id: movimento.setoristaId,
      vendas: movimento.vendas,
      comissao: movimento.comissao,
      comissao_retida: movimento.comissaoRetida,
      premios: movimento.premios,
      despesas: movimento.despesas,
      valor_liquido: movimento.valorLiquido
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      vendas: data.vendas,
      comissao: data.comissao,
      comissaoRetida: data.comissao_retida,
      premios: data.premios,
      despesas: data.despesas,
      valorLiquido: data.valor_liquido
    };
  } catch (error) {
    console.error('Erro ao atualizar movimento:', error);
    throw error;
  }
};

export const deleteMovimento = async (id: string): Promise<void> => {
  try {
    const { error } = await movimentosService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar movimento:', error);
    throw error;
  }
};

// Funções para Investimentos
export const getInvestimentos = async (): Promise<Investimento[]> => {
  try {
    const { data, error } = await investimentosService.getAll();
    if (error) throw error;
    
    return data?.map(investimento => ({
      id: investimento.id,
      data: new Date(investimento.data),
      setoristaId: investimento.setorista_id,
      setorista: investimento.setoristas ? {
        id: investimento.setoristas.id,
        nome: investimento.setoristas.nome,
        telefone: investimento.setoristas.telefone
      } : undefined,
      tipoInvestimento: investimento.tipo_investimento as any,
      valor: investimento.valor,
      descricao: investimento.descricao
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    return [];
  }
};

export const addInvestimento = async (investimento: Omit<Investimento, 'id'>): Promise<Investimento> => {
  try {
    const { data, error } = await investimentosService.create({
      data: investimento.data.toISOString().split('T')[0],
      setorista_id: investimento.setoristaId,
      tipo_investimento: investimento.tipoInvestimento,
      valor: investimento.valor,
      descricao: investimento.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      tipoInvestimento: data.tipo_investimento as any,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    throw error;
  }
};

export const updateInvestimento = async (investimento: Investimento): Promise<Investimento> => {
  try {
    const { data, error } = await investimentosService.update(investimento.id, {
      data: investimento.data.toISOString().split('T')[0],
      setorista_id: investimento.setoristaId,
      tipo_investimento: investimento.tipoInvestimento,
      valor: investimento.valor,
      descricao: investimento.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      tipoInvestimento: data.tipo_investimento as any,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    throw error;
  }
};

export const deleteInvestimento = async (id: string): Promise<void> => {
  try {
    const { error } = await investimentosService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    throw error;
  }
};

// Funções para Usuários
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const { data, error } = await usuariosService.getAll();
    if (error) throw error;
    
    return data?.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      role: usuario.role,
      ativo: usuario.ativo
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

export const addUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
  try {
    const { data, error } = await usuariosService.create({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      role: usuario.role,
      ativo: usuario.ativo
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      role: data.role,
      ativo: data.ativo
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const updateUsuario = async (usuario: Usuario): Promise<Usuario> => {
  try {
    const { data, error } = await usuariosService.update(usuario.id, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      role: usuario.role,
      ativo: usuario.ativo
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      role: data.role,
      ativo: data.ativo
    };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    const { error } = await usuariosService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

// Funções auxiliares que estavam faltando
export const getSetoristaById = async (id: string): Promise<Setorista | null> => {
  try {
    const { data, error } = await setoristasService.getById(id);
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      nome: data.nome,
      telefone: data.telefone,
      despesasFixas: [] // Será implementado separadamente
    };
  } catch (error) {
    console.error('Erro ao buscar setorista por ID:', error);
    return null;
  }
};

export const getDespesaById = async (id: string): Promise<Despesa | null> => {
  try {
    const { data, error } = await despesasService.getById(id);
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      data: new Date(data.data),
      tipoDespesa: data.tipo_despesa as any,
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao buscar despesa por ID:', error);
    return null;
  }
};

export const getMovimentoById = async (id: string): Promise<MovimentoFinanceiro | null> => {
  try {
    const { data, error } = await movimentosService.getById(id);
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      vendas: data.vendas,
      comissao: data.comissao,
      comissaoRetida: data.comissao_retida,
      premios: data.premios,
      despesas: data.despesas,
      valorLiquido: data.valor_liquido
    };
  } catch (error) {
    console.error('Erro ao buscar movimento por ID:', error);
    return null;
  }
};

export const getInvestimentoById = async (id: string): Promise<Investimento | null> => {
  try {
    const { data, error } = await investimentosService.getById(id);
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      data: new Date(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      tipoInvestimento: data.tipo_investimento as any,
      valor: data.valor,
      descricao: data.descricao
    };
  } catch (error) {
    console.error('Erro ao buscar investimento por ID:', error);
    return null;
  }
};