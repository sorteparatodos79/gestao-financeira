
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart3,
  Home, 
  CreditCard, 
  ShoppingBag, 
  PiggyBank, 
  Users,
  FileText, 
  MenuIcon,
  UserPlus,
  LogOut,
  Calculator,
  Shield,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface SidebarContentProps {
  pathname: string;
}

const SidebarContent = ({ pathname }: SidebarContentProps) => {
  const { logout } = useAuth();
  
  const navItems = [
    { to: "/", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/setoristas", label: "Setoristas", icon: <Users size={20} /> },
    { to: "/despesas", label: "Despesas", icon: <CreditCard size={20} /> },
    { to: "/movimentos", label: "Movimentos", icon: <ShoppingBag size={20} /> },
    { to: "/comissoes-retidas", label: "Comissões Retidas", icon: <Shield size={20} /> },
    { to: "/investimentos", label: "Investimentos", icon: <PiggyBank size={20} /> },
    { to: "/vales", label: "Vales", icon: <Receipt size={20} /> },
    { to: "/projecao", label: "Projeção", icon: <Calculator size={20} /> },
    { to: "/analise-performance", label: "Análise de Performance", icon: <TrendingUp size={20} /> },
    { to: "/usuarios", label: "Usuários", icon: <UserPlus size={20} /> },
  ];

  return (
    <div className="px-2 py-4 flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <BarChart3 size={24} className="text-sidebar-primary" />
        <h1 className="text-lg font-bold text-sidebar-foreground">Sorte Ouro Verde</h1>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.to}
          />
        ))}
      </nav>
      
      {/* Botão de logout */}
      <div className="px-2 py-2 mt-auto">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
      
      <div className="px-3 py-4">
        <div className="text-xs text-sidebar-foreground opacity-70">
          Sorte Ouro Verde Financeiro v1.0
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  
  // Desktop sidebar
  return (
    <>
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
          <SidebarContent pathname={location.pathname} />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-2 mt-2">
              <MenuIcon size={20} />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar">
            <SidebarContent pathname={location.pathname} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
