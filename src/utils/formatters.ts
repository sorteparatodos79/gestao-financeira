
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

// Converte uma string de data do banco (formato ISO) para um objeto Date local
// Evita problemas de fuso horário que causam diferença de um dia
export const parseDatabaseDate = (dateString: string): Date => {
  // Se a data vem no formato "2025-09-08", adiciona o horário local
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // Se já tem horário, usa diretamente
  return new Date(dateString);
};
