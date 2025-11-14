
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import SetoristasList from "./pages/setoristas/SetoristasList";
import SetoristaPage from "./pages/setoristas/SetoristaPage";
import DespesasList from "./pages/despesas/DespesasList";
import DespesaPage from "./pages/despesas/DespesaPage";
import MovimentosList from "./pages/movimentos/MovimentosList";
import MovimentoPage from "./pages/movimentos/MovimentoPage";
import InvestimentosList from "./pages/investimentos/InvestimentosList";
import InvestimentoPage from "./pages/investimentos/InvestimentoPage";
import UsuariosList from "./pages/usuarios/UsuariosList";
import UsuarioPage from "./pages/usuarios/UsuarioPage";
import CriarAdmin from "./pages/usuarios/CriarAdmin";
import ValesList from "./pages/vales/ValesList";
import ValePage from "./pages/vales/ValePage";
import ProjecaoPage from "./pages/projecao/ProjecaoPage";
import PerformanceAnalysisPage from "./pages/performance/PerformanceAnalysisPage";
import ComissoesRetidasList from "./pages/comissoes-retidas/ComissoesRetidasList";
import ComissaoRetidaPage from "./pages/comissoes-retidas/ComissaoRetidaPage";

const queryClient = new QueryClient();

// Componente de proteção de rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente de rotas administrativas
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Index />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Setoristas */}
      <Route path="/setoristas" element={
        <ProtectedRoute>
          <Layout>
            <SetoristasList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/setoristas/novo" element={
        <ProtectedRoute>
          <Layout>
            <SetoristaPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/setoristas/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <SetoristaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Despesas */}
      <Route path="/despesas" element={
        <ProtectedRoute>
          <Layout>
            <DespesasList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/despesas/novo" element={
        <ProtectedRoute>
          <Layout>
            <DespesaPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/despesas/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <DespesaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Movimentos */}
      <Route path="/movimentos" element={
        <ProtectedRoute>
          <Layout>
            <MovimentosList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/movimentos/novo" element={
        <ProtectedRoute>
          <Layout>
            <MovimentoPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/movimentos/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <MovimentoPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Investimentos */}
      <Route path="/investimentos" element={
        <ProtectedRoute>
          <Layout>
            <InvestimentosList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/investimentos/novo" element={
        <ProtectedRoute>
          <Layout>
            <InvestimentoPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/investimentos/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <InvestimentoPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Usuários (Admin) */}
      <Route path="/usuarios" element={
        <AdminRoute>
          <Layout>
            <UsuariosList />
          </Layout>
        </AdminRoute>
      } />
      <Route path="/usuarios/novo" element={
        <AdminRoute>
          <Layout>
            <UsuarioPage />
          </Layout>
        </AdminRoute>
      } />
      <Route path="/usuarios/editar/:id" element={
        <AdminRoute>
          <Layout>
            <UsuarioPage />
          </Layout>
        </AdminRoute>
      } />
      <Route path="/usuarios/criar-admin" element={
        <AdminRoute>
          <Layout>
            <CriarAdmin />
          </Layout>
        </AdminRoute>
      } />
      
      {/* Rotas de Vales */}
      <Route path="/vales" element={
        <ProtectedRoute>
          <Layout>
            <ValesList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vales/novo" element={
        <ProtectedRoute>
          <Layout>
            <ValePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vales/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <ValePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Comissões Retidas */}
      <Route path="/comissoes-retidas" element={
        <ProtectedRoute>
          <Layout>
            <ComissoesRetidasList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/comissoes-retidas/novo" element={
        <ProtectedRoute>
          <Layout>
            <ComissaoRetidaPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/comissoes-retidas/editar/:id" element={
        <ProtectedRoute>
          <Layout>
            <ComissaoRetidaPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rota de Projeção */}
      <Route path="/projecao" element={
        <ProtectedRoute>
          <Layout>
            <ProjecaoPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Rota de Análise de Performance */}
      <Route path="/analise-performance" element={
        <ProtectedRoute>
          <Layout>
            <PerformanceAnalysisPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <ShadcnToaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
