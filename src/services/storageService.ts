// Serviço de armazenamento usando Supabase
import { Despesa, Investimento, MovimentoFinanceiro, Setorista, Usuario, ExtraDiscount, ComissaoRetida, Vale } from "@/types/models";
import { parseDatabaseDate } from "@/utils/formatters";
import { 
  setoristasService, 
  despesasService, 
  movimentosService, 
  investimentosService,
  usuariosService,
  descontosExtrasService,
  comissoesRetidasService,
  valesService
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
    console.log('Chamando despesasService.getAll()...');
    const { data, error } = await despesasService.getAll();
    
    if (error) {
      console.error('Erro do Supabase:', error);
      throw new Error(`Erro do banco: ${error.message || JSON.stringify(error)}`);
    }
    
    console.log('Dados brutos do Supabase:', data?.length || 0, 'registros');
    
    return data?.map(despesa => ({
      id: despesa.id,
      data: parseDatabaseDate(despesa.data),
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
    console.error('Erro detalhado ao buscar despesas:', error);
    throw error; // Re-throw para que o componente possa capturar
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(movimento.data),
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(investimento.data),
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
    console.log('Preparando dados para criação de investimento:', {
      data: investimento.data.toISOString().split('T')[0],
      setorista_id: investimento.setoristaId,
      tipo_investimento: investimento.tipoInvestimento,
      valor: investimento.valor,
      descricao: investimento.descricao
    });

    const dadosParaInsercao = {
      data: investimento.data.toISOString().split('T')[0],
      setorista_id: investimento.setoristaId,
      tipo_investimento: investimento.tipoInvestimento,
      valor: investimento.valor,
      descricao: investimento.descricao
    };

    const { data, error } = await investimentosService.create(dadosParaInsercao);
    
    if (error) {
      console.error('Erro específico do Supabase:', error);
      throw new Error(`Erro do Supabase: ${error.message || JSON.stringify(error)}`);
    }
    
    console.log('Investimento criado com sucesso:', data);
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
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
    console.error('Erro detalhado ao criar investimento:', error);
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(data.data),
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
      data: parseDatabaseDate(data.data),
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

// Funções para Descontos Extras
export const getDescontosExtras = async (): Promise<ExtraDiscount[]> => {
  try {
    const { data, error } = await descontosExtrasService.getAll();
    if (error) throw error;
    
    return data?.map(desconto => ({
      id: desconto.id,
      mesAno: desconto.mes_ano,
      value: desconto.valor,
      description: desconto.descricao,
      createdAt: desconto.created_at ? new Date(desconto.created_at) : undefined,
      updatedAt: desconto.updated_at ? new Date(desconto.updated_at) : undefined
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar descontos extras:', error);
    return [];
  }
};

export const getDescontosExtrasByMesAno = async (mesAno: string): Promise<ExtraDiscount[]> => {
  try {
    const { data, error } = await descontosExtrasService.getByMesAno(mesAno);
    if (error) throw error;
    
    return data?.map(desconto => ({
      id: desconto.id,
      mesAno: desconto.mes_ano,
      value: desconto.valor,
      description: desconto.descricao,
      createdAt: desconto.created_at ? new Date(desconto.created_at) : undefined,
      updatedAt: desconto.updated_at ? new Date(desconto.updated_at) : undefined
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar descontos extras por mês/ano:', error);
    return [];
  }
};

export const addDescontoExtra = async (desconto: Omit<ExtraDiscount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExtraDiscount> => {
  try {
    const { data, error } = await descontosExtrasService.create({
      mes_ano: desconto.mesAno,
      descricao: desconto.description,
      valor: desconto.value
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      mesAno: data.mes_ano,
      value: data.valor,
      description: data.descricao,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  } catch (error) {
    console.error('Erro ao criar desconto extra:', error);
    throw error;
  }
};

export const updateDescontoExtra = async (desconto: ExtraDiscount): Promise<ExtraDiscount> => {
  try {
    const { data, error } = await descontosExtrasService.update(desconto.id, {
      mes_ano: desconto.mesAno,
      descricao: desconto.description,
      valor: desconto.value
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      mesAno: data.mes_ano,
      value: data.valor,
      description: data.descricao,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  } catch (error) {
    console.error('Erro ao atualizar desconto extra:', error);
    throw error;
  }
};

export const deleteDescontoExtra = async (id: string): Promise<void> => {
  try {
    const { error } = await descontosExtrasService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar desconto extra:', error);
    throw error;
  }
};

export const deleteDescontosExtrasByMesAno = async (mesAno: string): Promise<void> => {
  try {
    const { error } = await descontosExtrasService.deleteByMesAno(mesAno);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar descontos extras por mês/ano:', error);
    throw error;
  }
};

// Funções para Comissões Retidas
export const getComissoesRetidas = async (): Promise<ComissaoRetida[]> => {
  try {
    const { data, error } = await comissoesRetidasService.getAll();
    if (error) throw error;
    
    return data?.map(comissao => ({
      id: comissao.id,
      data: parseDatabaseDate(comissao.data),
      setoristaId: comissao.setorista_id,
      setorista: comissao.setoristas ? {
        id: comissao.setoristas.id,
        nome: comissao.setoristas.nome,
        telefone: comissao.setoristas.telefone
      } : undefined,
      valor: comissao.valor,
      descricao: comissao.descricao
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar comissões retidas:', error);
    return [];
  }
};

export const addComissaoRetida = async (comissaoRetida: Omit<ComissaoRetida, 'id'>): Promise<ComissaoRetida> => {
  try {
    const { data, error } = await comissoesRetidasService.create({
      data: comissaoRetida.data.toISOString().split('T')[0],
      setorista_id: comissaoRetida.setoristaId,
      valor: comissaoRetida.valor,
      descricao: comissaoRetida.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
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
    console.error('Erro ao criar comissão retida:', error);
    throw error;
  }
};

export const updateComissaoRetida = async (comissaoRetida: ComissaoRetida): Promise<ComissaoRetida> => {
  try {
    const { data, error } = await comissoesRetidasService.update(comissaoRetida.id, {
      data: comissaoRetida.data.toISOString().split('T')[0],
      setorista_id: comissaoRetida.setoristaId,
      valor: comissaoRetida.valor,
      descricao: comissaoRetida.descricao
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
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
    console.error('Erro ao atualizar comissão retida:', error);
    throw error;
  }
};

export const deleteComissaoRetida = async (id: string): Promise<void> => {
  try {
    const { error } = await comissoesRetidasService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar comissão retida:', error);
    throw error;
  }
};

// Funções para vales
export const getVales = async (): Promise<Vale[]> => {
  try {
    console.log('Chamando valesService.getAll()...');
    const { data, error } = await valesService.getAll();
    
    if (error) throw error;
    
    console.log('Dados brutos do Supabase:', data?.length || 0, 'registros');
    
    const vales: Vale[] = (data || []).map(item => ({
      id: item.id,
      data: parseDatabaseDate(item.data),
      setoristaId: item.setorista_id,
      setorista: item.setoristas ? {
        id: item.setoristas.id,
        nome: item.setoristas.nome,
        telefone: item.setoristas.telefone
      } : undefined,
      valor: item.valor,
      descricao: item.descricao,
      recebido: item.recebido,
      dataRecebimento: item.data_recebimento ? parseDatabaseDate(item.data_recebimento) : undefined
    }));
    
    console.log('Vales processados:', vales.length);
    return vales;
  } catch (error) {
    console.error('Erro ao buscar vales:', error);
    throw error;
  }
};

export const getValeById = async (id: string): Promise<Vale | null> => {
  try {
    const { data, error } = await valesService.getById(id);
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao,
      recebido: data.recebido,
      dataRecebimento: data.data_recebimento ? parseDatabaseDate(data.data_recebimento) : undefined
    };
  } catch (error) {
    console.error('Erro ao buscar vale por ID:', error);
    throw error;
  }
};

export const addVale = async (vale: Omit<Vale, 'id'>): Promise<Vale> => {
  try {
    const { data, error } = await valesService.create({
      data: vale.data.toISOString().split('T')[0],
      setorista_id: vale.setoristaId,
      valor: vale.valor,
      descricao: vale.descricao,
      recebido: vale.recebido || false,
      data_recebimento: vale.dataRecebimento?.toISOString().split('T')[0]
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao,
      recebido: data.recebido,
      dataRecebimento: data.data_recebimento ? parseDatabaseDate(data.data_recebimento) : undefined
    };
  } catch (error) {
    console.error('Erro ao criar vale:', error);
    throw error;
  }
};

export const updateVale = async (vale: Vale): Promise<Vale> => {
  try {
    const { data, error } = await valesService.update(vale.id, {
      data: vale.data.toISOString().split('T')[0],
      setorista_id: vale.setoristaId,
      valor: vale.valor,
      descricao: vale.descricao,
      recebido: vale.recebido,
      data_recebimento: vale.dataRecebimento?.toISOString().split('T')[0]
    });
    
    if (error) throw error;
    
    return {
      id: data.id,
      data: parseDatabaseDate(data.data),
      setoristaId: data.setorista_id,
      setorista: data.setoristas ? {
        id: data.setoristas.id,
        nome: data.setoristas.nome,
        telefone: data.setoristas.telefone
      } : undefined,
      valor: data.valor,
      descricao: data.descricao,
      recebido: data.recebido,
      dataRecebimento: data.data_recebimento ? parseDatabaseDate(data.data_recebimento) : undefined
    };
  } catch (error) {
    console.error('Erro ao atualizar vale:', error);
    throw error;
  }
};

export const deleteVale = async (id: string): Promise<void> => {
  try {
    const { error } = await valesService.delete(id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar vale:', error);
    throw error;
  }
};