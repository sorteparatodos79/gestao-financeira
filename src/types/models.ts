// Tipos de modelos para o sistema financeiro

export type Setorista = {
  id: string;
  nome: string;
  telefone: string;
}

export type TipoDespesa = 
  | 'Salario Mensal'
  | 'Quinzena'
  | 'Comissão'
  | 'Internet'
  | 'Aluguel'
  | 'Ajuda de Custos'
  | 'Combustivel'
  | 'Material de Limpeza'
  | 'Alimentação'
  | 'Sistema'
  | 'Chips'
  | 'Descarrego'
  | 'Outros';

export type Despesa = {
  id: string;
  data: Date;
  tipoDespesa: TipoDespesa;
  setoristaId: string;
  setorista?: Setorista;
  valor: number;
  descricao?: string;
}

export type MovimentoFinanceiro = {
  id: string;
  data: Date;
  setoristaId: string;
  setorista?: Setorista;
  vendas: number;
  comissao: number;
  comissaoRetida: number;
  premios: number;
  despesas: number;
  valorLiquido: number;
}

export type TipoInvestimento = 
  | 'Aquisição de Vendedores'
  | 'Equipamento'
  | 'Publicidade'
  | 'Desenvolvimento de Software'
  | 'Treinamento'
  | 'Infraestrutura'
  | 'Outros';

export type Investimento = {
  id: string;
  data: Date;
  setoristaId: string;
  setorista?: Setorista;
  tipoInvestimento: TipoInvestimento;
  valor: number;
  descricao?: string;
}

export type Usuario = {
  id: string;
  nome: string;
  login: string;
  senha: string;
  role: 'admin' | 'user';
  ativo: boolean;
}

export interface ExtraDiscount {
  id: string;
  mesAno: string; // Formato: YYYY-MM (ex: 2025-01)
  value: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}
