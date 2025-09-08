
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RelatoriosPage = () => {
  const [activeTab, setActiveTab] = useState("despesas");

  const handleExportar = (tipo: string) => {
    // Aqui seria implementada a lógica de exportação real
    // Por enquanto, apenas mostraremos uma mensagem de feedback
    toast.success(`Exportando relatório de ${tipo} para PDF...`);
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-2 h-8 w-8" />
              Relatórios
            </h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios do sistema
            </p>
          </div>
          <Button 
            onClick={() => handleExportar(activeTab)} 
            className="mt-4 sm:mt-0"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Selecione o Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="despesas" onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="despesas" className="flex-1">Despesas</TabsTrigger>
              <TabsTrigger value="movimentos" className="flex-1">Movimentos</TabsTrigger>
              <TabsTrigger value="investimentos" className="flex-1">Investimentos</TabsTrigger>
            </TabsList>
            <TabsContent value="despesas">
              {/* We'll let the routing system handle this content now */}
            </TabsContent>
            <TabsContent value="movimentos">
              {/* We'll let the routing system handle this content now */}
            </TabsContent>
            <TabsContent value="investimentos">
              {/* We'll let the routing system handle this content now */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosPage;
