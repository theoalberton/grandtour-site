import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDestinationStore } from '../store/destinationStore';
import Card from '../components/ui/Card';
import { User, MapPin } from 'lucide-react';

const AccountPage: React.FC = () => {
  const { user } = useAuthStore();
  const { destinations, fetchDestinations, isLoading } = useDestinationStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    
    fetchDestinations();
  }, [user, navigate, fetchDestinations]);
  
  const purchasedDestinations = destinations.filter(
    destination => user?.purchasedTours.includes(destination.id)
  );
  
  if (!user) {
    return null; // User will be redirected via the useEffect
  }
  
  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <User size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-800 font-heading">Minha Conta</h1>
        </div>
        <p className="text-gray-600">
          Bem-vindo de volta, {user.name || user.email}! Aqui você pode gerenciar seus tours e acessar seus áudios.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Email</h3>
            <p className="text-gray-800">{user.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Tipo de Conta</h3>
            <p className="text-gray-800">{user.isAdmin ? 'Administrador' : 'Usuário'}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin size={24} className="text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-800">Meus Tours</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : purchasedDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedDestinations.map((destination) => (
              <Card
                key={destination.id}
                imageUrl={destination.imageUrl}
                title={destination.name}
                subtitle={destination.country}
                href={`/destinations/${destination.id}`}
                badge="Comprado"
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              Você ainda não comprou nenhum tour. Explore nossa seleção de destinos!
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-primary-500 font-medium hover:text-primary-700"
            >
              Ver destinos disponíveis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;