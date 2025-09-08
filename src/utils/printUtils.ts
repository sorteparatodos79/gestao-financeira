
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

/**
 * Custom hook to handle printing functionality
 * @param printRef Reference to the element to be printed
 * @param documentTitle Title of the printed document
 * @returns Object with the print handler function
 */
export const usePrintHandler = (printRef: React.RefObject<HTMLElement>, documentTitle: string) => {
  const handlePrint = useReactToPrint({
    documentTitle,
    content: () => printRef.current,
    pageStyle: "print",
    onAfterPrint: () => toast.success('Relatório gerado com sucesso!'),
    onPrintError: () => toast.error('Erro ao gerar o relatório'),
  });
  
  return { printHandler: handlePrint };
};
