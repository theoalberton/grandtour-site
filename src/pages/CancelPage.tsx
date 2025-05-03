import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Pagamento Cancelado
        </h1>
        
        <p className="text-gray-600 mb-8">
          O processo de pagamento foi cancelado. Se você encontrou algum problema, entre em contato conosco.
        </p>
        
        <div className="space-y-4">
          <Link to="/">
            <Button fullWidth>
              Voltar para Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;