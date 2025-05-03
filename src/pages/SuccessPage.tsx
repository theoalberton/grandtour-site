import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Pagamento Confirmado!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Seu pagamento foi processado com sucesso. Você já pode acessar todos os áudios do tour adquirido.
        </p>
        
        <div className="space-y-4">
          <Link to="/account">
            <Button fullWidth>
              Ver Meus Tours
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" fullWidth>
              Voltar para Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;