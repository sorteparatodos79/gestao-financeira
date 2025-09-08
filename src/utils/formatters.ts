
// Funções para formatação de valores

// Formata valor como moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formata data no padrão brasileiro
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Formata um objeto Date para o formato esperado pelo input type="date"
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Converte uma string de data do formato do input para um objeto Date
export const parseInputDate = (dateString: string): Date => {
  return new Date(dateString);
};
