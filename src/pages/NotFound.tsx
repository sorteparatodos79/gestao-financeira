
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página Não Encontrada</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        A página que você está procurando não existe ou foi movida.
        Por favor, retorne à página inicial para continuar.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
