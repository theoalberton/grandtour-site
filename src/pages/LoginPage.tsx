import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    
    // If the login was successful, navigate to the home page
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-heading">Login</h1>
          <p className="text-gray-600">Acesse sua conta para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          
          <Input
            label="Senha"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" fullWidth isLoading={isLoading}>
            Entrar
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary-500 hover:underline">
                Crie uma aqui
              </Link>
            </p>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="text-sm text-gray-500 mb-2">Credenciais para teste:</div>
            <div className="text-xs text-gray-500">Admin: admin@grandtour.com / admin123</div>
            <div className="text-xs text-gray-500">Usuário: user@example.com / password123</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;