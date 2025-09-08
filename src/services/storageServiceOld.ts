import { Despesa, Investimento, MovimentoFinanceiro, Setorista } from "@/types/models";
import { DespesaFixa } from "../types/models";

// Chaves para armazenamento no localStorage
const STORAGE_KEYS = {
  SETORISTAS: 'sorte-para-todos-setoristas',
  DESPESAS: 'sorte-para-todos-despesas',
  MOVIMENTOS: 'sorte-para-todos-movimentos',
  INVESTIMENTOS: 'sorte-para-todos-investimentos'
};

// Função genérica para salvar dados
const saveData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Função genérica para recuperar dados
const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Funções para Setoristas
export const getSetoristas = (): Setorista[] => {
  return getData<Setorista>(STORAGE_KEYS.SETORISTAS);
};

export const addSetorista = (setorista: Omit<Setorista, 'id'>): Setorista => {
  const setoristas = getSetoristas();
  const newSetorista = { ...setorista, id: crypto.randomUUID() };
  
  setoristas.push(newSetorista);
  saveData(STORAGE_KEYS.SETORISTAS, setoristas);
  
  return newSetorista;
};

export const updateSetorista = (setorista: Setorista): Setorista => {
  const setoristas = getSetoristas();
  const index = setoristas.findIndex(s => s.id === setorista.id);
  
  if (index !== -1) {
    setoristas[index] = setorista;
    saveData(STORAGE_KEYS.SETORISTAS, setoristas);
  }
  
  return setorista;
};

export const deleteSetorista = (id: string): void => {
  const setoristas = getSetoristas();
  const filtered = setoristas.filter(s => s.id !== id);
  saveData(STORAGE_KEYS.SETORISTAS, filtered);
};

export const getSetoristaById = (id: string): Setorista | undefined => {
  const setoristas = getSetoristas();
  return setoristas.find(s => s.id === id);
};

export const addDespesaFixa = (setoristaId: string, despesaFixa: Omit<DespesaFixa, 'id'>): DespesaFixa => {
  const setoristas = getSetoristas();
  const setoristaIndex = setoristas.findIndex(s => s.id === setoristaId);
  
  if (setoristaIndex === -1) {
    throw new Error('Setorista não encontrado');
  }
  
  const novaDespesaFixa = {
    ...despesaFixa,
    id: crypto.randomUUID(),
    setoristaId
  };
  
  if (!setoristas[setoristaIndex].despesasFixas) {
    setoristas[setoristaIndex].despesasFixas = [];
  }
  
  setoristas[setoristaIndex].despesasFixas?.push(novaDespesaFixa);
  saveData(STORAGE_KEYS.SETORISTAS, setoristas);
  
  return novaDespesaFixa;
};

export const updateDespesaFixa = (setoristaId: string, despesaFixa: DespesaFixa): DespesaFixa => {
  const setoristas = getSetoristas();
  const setoristaIndex = setoristas.findIndex(s => s.id === setoristaId);
  
  if (setoristaIndex === -1) {
    throw new Error('Setorista não encontrado');
  }
  
  const despesaFixaIndex = setoristas[setoristaIndex].despesasFixas?.findIndex(d => d.id === despesaFixa.id);
  
  if (despesaFixaIndex === undefined || despesaFixaIndex === -1) {
    throw new Error('Despesa fixa não encontrada');
  }
  
  if (setoristas[setoristaIndex].despesasFixas) {
    setoristas[setoristaIndex].despesasFixas[despesaFixaIndex] = despesaFixa;
    saveData(STORAGE_KEYS.SETORISTAS, setoristas);
  }
  
  return despesaFixa;
};

export const deleteDespesaFixa = (setoristaId: string, despesaFixaId: string): void => {
  const setoristas = getSetoristas();
  const setoristaIndex = setoristas.findIndex(s => s.id === setoristaId);
  
  if (setoristaIndex === -1) {
    throw new Error('Setorista não encontrado');
  }
  
  if (setoristas[setoristaIndex].despesasFixas) {
    setoristas[setoristaIndex].despesasFixas = setoristas[setoristaIndex].despesasFixas?.filter(
      d => d.id !== despesaFixaId
    );
    saveData(STORAGE_KEYS.SETORISTAS, setoristas);
  }
};

// Funções para Despesas
export const getDespesas = (): Despesa[] => {
  const despesas = getData<Despesa>(STORAGE_KEYS.DESPESAS);
  return despesas.map(d => ({
    ...d,
    data: new Date(d.data)
  }));
};

export const addDespesa = (despesa: Omit<Despesa, 'id'>): Despesa => {
  const despesas = getDespesas();
  const newDespesa = { ...despesa, id: crypto.randomUUID() };
  
  despesas.push(newDespesa);
  saveData(STORAGE_KEYS.DESPESAS, despesas);
  
  return newDespesa;
};

export const updateDespesa = (despesa: Despesa): Despesa => {
  const despesas = getDespesas();
  const index = despesas.findIndex(d => d.id === despesa.id);
  
  if (index !== -1) {
    despesas[index] = despesa;
    saveData(STORAGE_KEYS.DESPESAS, despesas);
  }
  
  return despesa;
};

export const deleteDespesa = (id: string): void => {
  const despesas = getDespesas();
  const filtered = despesas.filter(d => d.id !== id);
  saveData(STORAGE_KEYS.DESPESAS, filtered);
};

// Funções para Movimentos Financeiros
export const getMovimentos = (): MovimentoFinanceiro[] => {
  const movimentos = getData<MovimentoFinanceiro>(STORAGE_KEYS.MOVIMENTOS);
  return movimentos.map(m => ({
    ...m,
    data: new Date(m.data)
  }));
};

export const addMovimento = (movimento: Omit<MovimentoFinanceiro, 'id' | 'valorLiquido'>): MovimentoFinanceiro => {
  const movimentos = getMovimentos();
  const valorLiquido = movimento.vendas - movimento.comissao - movimento.premios - movimento.despesas;
  const newMovimento = { ...movimento, id: crypto.randomUUID(), valorLiquido };
  
  movimentos.push(newMovimento);
  saveData(STORAGE_KEYS.MOVIMENTOS, movimentos);
  
  return newMovimento;
};

export const updateMovimento = (movimento: Omit<MovimentoFinanceiro, 'valorLiquido'>): MovimentoFinanceiro => {
  const movimentos = getMovimentos();
  const valorLiquido = movimento.vendas - movimento.comissao - movimento.premios - movimento.despesas;
  const updatedMovimento = { ...movimento, valorLiquido };
  
  const index = movimentos.findIndex(m => m.id === movimento.id);
  
  if (index !== -1) {
    movimentos[index] = updatedMovimento;
    saveData(STORAGE_KEYS.MOVIMENTOS, movimentos);
  }
  
  return updatedMovimento;
};

export const deleteMovimento = (id: string): void => {
  const movimentos = getMovimentos();
  const filtered = movimentos.filter(m => m.id !== id);
  saveData(STORAGE_KEYS.MOVIMENTOS, filtered);
};

// Funções para Investimentos
export const getInvestimentos = (): Investimento[] => {
  const investimentos = getData<Investimento>(STORAGE_KEYS.INVESTIMENTOS);
  return investimentos.map(i => ({
    ...i,
    data: new Date(i.data)
  }));
};

export const addInvestimento = (investimento: Omit<Investimento, 'id'>): Investimento => {
  const investimentos = getInvestimentos();
  const newInvestimento = { ...investimento, id: crypto.randomUUID() };
  
  investimentos.push(newInvestimento);
  saveData(STORAGE_KEYS.INVESTIMENTOS, investimentos);
  
  return newInvestimento;
};

export const updateInvestimento = (investimento: Investimento): Investimento => {
  const investimentos = getInvestimentos();
  const index = investimentos.findIndex(i => i.id === investimento.id);
  
  if (index !== -1) {
    investimentos[index] = investimento;
    saveData(STORAGE_KEYS.INVESTIMENTOS, investimentos);
  }
  
  return investimento;
};

export const deleteInvestimento = (id: string): void => {
  const investimentos = getInvestimentos();
  const filtered = investimentos.filter(i => i.id !== id);
  saveData(STORAGE_KEYS.INVESTIMENTOS, filtered);
};
