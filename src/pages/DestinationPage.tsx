import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDestinationStore } from '../store/destinationStore';
import { useAuthStore } from '../store/authStore';
import { useStripe } from '../hooks/useStripe'; // Import useStripe
import Button from '../components/ui/Button';
import AudioPlayer from '../components/ui/AudioPlayer';
import { MapPin, LockIcon, CreditCard } from 'lucide-react';

const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDestination, fetchDestinations, isLoading: isDestLoading } = useDestinationStore();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { purchaseGrandTour, isLoading: isStripeLoading } = useStripe(); // Use the Stripe hook
  const [isPurchasing, setIsPurchasing] = useState(false); // Keep local state if needed for UI feedback

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const destination = id ? getDestination(id) : undefined;

  // TODO: Fetch purchased tours from DB based on user ID instead of relying on mock data
  const hasPurchased = user?.purchasedTours.includes(id || '');
  const TEMP_ALWAYS_SHOW_AUDIO = true; // TEMPORARY FLAG FOR TESTING AUDIO URLS

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (id && destination) {
      setIsPurchasing(true); // Indicate purchase attempt started
      try {
        // Call the correct function from useStripe
        await purchaseGrandTour(destination.name, destination.price, id);
        // purchaseGrandTour handles redirection to Stripe, no need to set isPurchasing to false here
        // unless there's an error caught below.
      } catch (error) {
        console.error("Error initiating purchase:", error);
        alert("Ocorreu um erro ao iniciar o processo de compra. Por favor, tente novamente.");
        setIsPurchasing(false); // Reset state on error
      }
    } else {
        alert("ID do destino inválido ou destino não encontrado.");
    }
  };

  if (isDestLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Destino não encontrado</h1>
        <p className="text-gray-600 mb-6">
          O destino que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/')}>Voltar para Home</Button>
      </div>
    );
  }

  // Log URLs for debugging
  console.log('Destination Page - Hero Image URL:', destination.imageUrl);
  console.log('Destination Page - Intro Audio URL:', destination.introAudioUrl);
  destination.pointsOfInterest.forEach((poi, index) => {
    console.log(`Destination Page - POI ${index} Image URL:`, poi.imageUrl);
    console.log(`Destination Page - POI ${index} Audio URL:`, poi.audioUrl);
  });

  return (
    <div>
      {/* Hero section */}
      <section className="relative h-80 md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          // Use placeholder if URL is invalid/empty
          style={{ backgroundImage: `url(${destination.imageUrl || '/placeholder.png'})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative h-full flex flex-col justify-end px-4 pb-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">
            {destination.name}
          </h1>
          <p className="text-white text-lg mb-4">{destination.country}</p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Sobre {destination.name}</h2>
              <p className="text-gray-700 mb-6">{destination.description}</p>

              {/* TEMPORARY: Always show intro audio player for testing */}
              {(hasPurchased || TEMP_ALWAYS_SHOW_AUDIO) && destination.introAudioUrl ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Áudio Introdução</h3>
                  <AudioPlayer
                    audioUrl={destination.introAudioUrl}
                    title={`Introdução a ${destination.name}`}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LockIcon size={18} className="text-gray-500" />
                    <span className="text-gray-700">
                      Compre o tour para acessar o áudio de introdução e todos os pontos turísticos
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Pontos Turísticos</h2>
              <div className="space-y-6">
                {destination.pointsOfInterest.map((poi) => (
                  <div key={poi.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {poi.imageUrl && (
                        <img
                          src={poi.imageUrl}
                          alt={poi.name}
                          className="w-full md:w-40 h-32 object-cover rounded-lg"
                          // Add error handler for debugging image loading
                          onError={(e) => console.error(`Error loading POI image ${poi.imageUrl}:`, e)}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{poi.name}</h3>
                        <p className="text-gray-700 mb-4">{poi.description}</p>

                        {/* TEMPORARY: Always show POI audio player for testing */}
                        {(hasPurchased || TEMP_ALWAYS_SHOW_AUDIO) && poi.audioUrl ? (
                          <AudioPlayer
                            audioUrl={poi.audioUrl}
                            title={poi.name}
                          />
                        ) : (
                          <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
                            <LockIcon size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-700">
                              Compre o tour para acessar este áudio
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Informações do Tour</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontos Turísticos:</span>
                  <span className="font-medium">{destination.pointsOfInterest.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preço:</span>
                  <span className="font-medium">€{destination.price.toFixed(2)}</span>
                </div>
              </div>

              {hasPurchased ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-700 font-medium">
                    Você já comprou este tour
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Aproveite todos os áudios disponíveis
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handlePurchase}
                  fullWidth
                  // Use combined loading state from Stripe hook and local state
                  isLoading={isStripeLoading || isPurchasing || isAuthLoading}
                >
                  <CreditCard size={18} className="mr-2" />
                  Comprar Tour - €{destination.price.toFixed(2)}
                </Button>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Local do Tour</h3>
                <div className="flex items-start space-x-2">
                  <MapPin size={18} className="text-primary-500 mt-0.5" />
                  <span className="text-gray-600">{destination.name}, {destination.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DestinationPage;

