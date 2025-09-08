
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, usuariosService } from '@/services/supabaseService';

type AuthUser = {
  login: string;
  role: string;
  isLoggedIn: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (login: string, senha: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verificar se há uma sessão ativa no localStorage
    const storedSession = localStorage.getItem('userSession');
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession.isLoggedIn) {
          setUser(parsedSession);
        }
      } catch (error) {
        console.error('Erro ao ler sessão do usuário:', error);
        localStorage.removeItem('userSession');
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const login = async (login: string, senha: string): Promise<boolean> => {
    try {
      console.log('🔍 Tentativa de login:', { login, senha: '***' });
      
      // Buscar usuário no banco de dados
      const { data: usuarios, error } = await usuariosService.getAll();
      
      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        toast.error('Erro ao conectar com o banco de dados');
        return false;
      }
      
      console.log('📊 Usuários encontrados:', usuarios?.length || 0);
      console.log('👥 Lista de usuários:', usuarios);
      
      // Verificar se o usuário existe e está ativo (buscar por login)
      const foundUser = usuarios?.find(
        u => {
          const matchLogin = u.login === login || u.nome === login;
          const matchPassword = u.senha === senha;
          const isActive = u.ativo;
          
          console.log('🔍 Verificando usuário:', {
            nome: u.nome,
            login: u.login,
            senha: u.senha,
            ativo: u.ativo,
            matchLogin,
            matchPassword,
            isActive
          });
          
          return matchLogin && matchPassword && isActive;
        }
      );
      
      if (foundUser) {
        console.log('✅ Usuário encontrado:', foundUser);
        const userData = {
          login: foundUser.login, // Usar o campo login do usuário
          role: foundUser.role,
          isLoggedIn: true
        };
        
        setUser(userData);
        localStorage.setItem('userSession', JSON.stringify(userData));
        toast.success('Login realizado com sucesso!');
        return true;
      }
      
      console.log('❌ Usuário não encontrado ou credenciais inválidas');
      toast.error('Login ou senha incorretos');
      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast.error('Erro ao fazer login');
      return false;
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
