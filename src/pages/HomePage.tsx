import React, { useEffect } from 'react';
import { useDestinationStore } from '../store/destinationStore';
import Card from '../components/ui/Card';
import { MapPin } from 'lucide-react';

const HomePage: React.FC = () => {
  const { destinations, fetchDestinations, isLoading } = useDestinationStore();
  
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 bg-primary-800">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" 
             style={{ backgroundImage: "url('https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            Conheça a Espanha com o Grand Tour
          </h1>
          <p className="text-xl text-white max-w-3xl">
            Explore os melhores destinos com nosso guia turístico digital por áudio
          </p>
        </div>
      </section>
      
      {/* Destinations Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center mb-2">
            <MapPin className="h-6 w-6 text-primary-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800 font-heading">Destinos Disponíveis</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha entre nossos destinos cuidadosamente selecionados e descubra a Espanha através de áudios detalhados
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                imageUrl={destination.imageUrl}
                title={destination.name}
                subtitle={destination.country}
                href={`/destinations/${destination.id}`}
                badge={destination.tourCount}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* How It Works Section */}
      <section className="bg-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 font-heading mb-2">Como Funciona</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore destinos incríveis com nossos guias de áudio em apenas três passos simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Escolha um Destino</h3>
              <p className="text-gray-600">
                Navegue por nossa seleção de destinos e escolha o que mais lhe interessa
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compre o Tour</h3>
              <p className="text-gray-600">
                Adquira o tour por apenas 2,50€ e tenha acesso a todos os áudios do destino
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Explore com Áudio</h3>
              <p className="text-gray-600">
                Ouça os guias de áudio para cada ponto turístico quando e onde quiser
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;