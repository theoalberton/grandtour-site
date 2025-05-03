import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDestinationStore } from '../store/destinationStore';
import { PointOfInterest, Destination } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash, Edit, Check, X, MapPin, Upload, Image as ImageIcon, Music } from 'lucide-react';

// Type for the form state, allowing File or string URL
type DestinationFormState = Omit<Destination, 'id' | 'tourCount' | 'imageUrl' | 'introAudioUrl' | 'pointsOfInterest'> & {
    imageUrl?: File | string | null;
    introAudioUrl?: File | string | null;
    pointsOfInterest: Array<Omit<PointOfInterest, 'id' | 'imageUrl' | 'audioUrl'> & {
        id?: string; // Keep track of original POI ID for updates
        imageUrl?: File | string | null;
        audioUrl?: File | string | null;
    }>;
};

type POIFormState = Omit<PointOfInterest, 'id' | 'imageUrl' | 'audioUrl'> & {
    imageUrl?: File | string | null;
    audioUrl?: File | string | null;
};

const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const { destinations, fetchDestinations, addDestination, updateDestination, deleteDestination, isLoading, error } = useDestinationStore();
  const navigate = useNavigate();

  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  const initialFormState: DestinationFormState = {
    name: '',
    country: '',
    description: '',
    imageUrl: null,
    introAudioUrl: null,
    pointsOfInterest: [],
    price: 2.5,
  };

  const initialPOIState: POIFormState = {
    name: '',
    description: '',
    imageUrl: null,
    audioUrl: null,
  };

  const [formState, setFormState] = useState<DestinationFormState>(initialFormState);
  const [newPOI, setNewPOI] = useState<POIFormState>(initialPOIState);

  useEffect(() => {
    // TODO: Implement proper admin role check based on Supabase Auth
    // if (!user || !user.isAdmin) {
    //   navigate('/');
    // }
    if (!user) { // Temporary check until isAdmin is properly implemented
        console.warn("User not logged in or isAdmin flag missing, redirecting might be needed in production.");
        // navigate('/');
    }

    fetchDestinations();
  }, [user, navigate, fetchDestinations]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof DestinationFormState) => {
    if (e.target.files && e.target.files[0]) {
      setFormState(prev => ({ ...prev, [field]: e.target.files![0] }));
    } else {
      setFormState(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePOIInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPOI(prev => ({ ...prev, [name]: value }));
  };

  const handlePOIFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof POIFormState) => {
    if (e.target.files && e.target.files[0]) {
      setNewPOI(prev => ({ ...prev, [field]: e.target.files![0] }));
    } else {
      setNewPOI(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddPOI = () => {
    // Basic validation
    if (!newPOI.name || !newPOI.description || !newPOI.audioUrl) {
        alert("Nome, descrição e áudio são obrigatórios para o Ponto Turístico.");
        return;
    }

    const poiToAdd = {
      ...newPOI,
      // Generate a temporary client-side ID for list management
      // The actual ID will be assigned by the database on save
      id: `temp-${Date.now().toString()}`,
    };

    setFormState(prev => ({
      ...prev,
      pointsOfInterest: [...prev.pointsOfInterest, poiToAdd],
    }));

    setNewPOI(initialPOIState); // Reset POI form
  };

  const handleRemovePOI = (poiIdToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      pointsOfInterest: prev.pointsOfInterest.filter(poi => poi.id !== poiIdToRemove),
    }));
  };

  const handleSaveDestination = async () => {
    // Basic validation
    if (!formState.name || !formState.country || !formState.description || !formState.imageUrl || !formState.introAudioUrl) {
        alert("Nome, País, Descrição, Imagem Principal e Áudio de Introdução são obrigatórios.");
        return;
    }

    if (editingDestinationId) {
      await updateDestination(editingDestinationId, formState);
    } else {
      await addDestination(formState);
    }

    // Reset form and state after successful save
    if (!error) { // Only reset if there was no error during save
        setIsAddingDestination(false);
        setEditingDestinationId(null);
        setFormState(initialFormState);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este destino? Esta ação não pode ser desfeita e apagará também os pontos turísticos associados.')) {
      await deleteDestination(id);
    }
  };

  const handleEditDestination = (destination: Destination) => {
    setEditingDestinationId(destination.id);
    setIsAddingDestination(false); // Ensure add form is hidden
    setFormState({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      imageUrl: destination.imageUrl, // Keep URL string for display/potential reuse
      introAudioUrl: destination.introAudioUrl,
      price: destination.price,
      pointsOfInterest: destination.pointsOfInterest.map(poi => ({ // Keep URL strings
          id: poi.id, // Important: Keep original ID
          name: poi.name,
          description: poi.description,
          imageUrl: poi.imageUrl,
          audioUrl: poi.audioUrl,
      })),
    });
  };

  const handleCancel = () => {
    setIsAddingDestination(false);
    setEditingDestinationId(null);
    setFormState(initialFormState);
    setNewPOI(initialPOIState);
  };

  // Helper to display file name or URL
  const renderFileInfo = (fileOrUrl: File | string | null | undefined, type: 'image' | 'audio') => {
    if (fileOrUrl instanceof File) {
      return <span className="text-sm text-gray-600 ml-2">{fileOrUrl.name}</span>;
    } else if (typeof fileOrUrl === 'string') {
      return <a href={fileOrUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline ml-2">Ver {type === 'image' ? 'Imagem' : 'Áudio'} Atual</a>;
    }
    return null;
  };

  // Component for File Input
  const FileInput = ({ label, id, accept, currentFile, onChange, icon: Icon }: {
      label: string;
      id: string;
      accept: string;
      currentFile: File | string | null | undefined;
      onChange: (e: ChangeEvent<HTMLInputElement>) => void;
      icon: React.ElementType;
  }) => (
      <div>
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
          </label>
          <div className="flex items-center">
              <label htmlFor={id} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 inline-flex items-center">
                  <Icon size={16} className="mr-2" />
                  Selecionar Ficheiro
              </label>
              <input id={id} name={id} type="file" accept={accept} className="sr-only" onChange={onChange} />
              {renderFileInfo(currentFile, accept.includes('image') ? 'image' : 'audio')}
          </div>
          {currentFile instanceof File && (
              <button
                  type="button"
                  onClick={() => {
                      // Simulate clearing the file input by resetting the specific state field
                      const fieldName = id.includes('POI') ? (id.includes('image') ? 'imageUrl' : 'audioUrl') : (id.includes('image') ? 'imageUrl' : 'introAudioUrl');
                      if (id.includes('POI')) {
                          setNewPOI(prev => ({ ...prev, [fieldName]: null }));
                      } else {
                          setFormState(prev => ({ ...prev, [fieldName]: null }));
                      }
                      // Clear the actual input value if possible (might need ref)
                      const inputElement = document.getElementById(id) as HTMLInputElement;
                      if (inputElement) inputElement.value = '';
                  }}
                  className="text-xs text-red-600 hover:text-red-800 ml-2 mt-1"
              >
                  Limpar seleção
              </button>
          )}
      </div>
  );

  // Main Render
  // if (!user || !user.isAdmin) {
  //   return null; // User will be redirected via the useEffect
  // }

  const FormComponent = (
    <div className={`mt-6 bg-white rounded-lg shadow-md p-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <h3 className="text-lg font-semibold mb-4">
        {editingDestinationId ? 'Editar Destino' : 'Adicionar Novo Destino'}
      </h3>

      {error && <p className="text-red-500 mb-4">Erro: {error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); handleSaveDestination(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Destino"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <Input
            label="País"
            name="country"
            value={formState.country}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <Input
            label="Preço (€)"
            name="price"
            type="number"
            step="0.01"
            value={formState.price}
            onChange={handlePriceChange}
            fullWidth
            required
          />
          {/* Image Upload */}
          <FileInput
            label="Imagem Principal"
            id="imageUrl"
            accept="image/*"
            currentFile={formState.imageUrl}
            onChange={(e) => handleFileChange(e, 'imageUrl')}
            icon={ImageIcon}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Audio Upload */}
        <FileInput
          label="Áudio de Introdução"
          id="introAudioUrl"
          accept="audio/*"
          currentFile={formState.introAudioUrl}
          onChange={(e) => handleFileChange(e, 'introAudioUrl')}
          icon={Music}
        />

        {/* Points of Interest Section */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Pontos Turísticos</h3>

          {formState.pointsOfInterest.map((poi, index) => (
            <div key={poi.id || `poi-${index}`} className="p-3 border rounded-md mb-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{poi.name}</span>
                <Button
                  onClick={() => handleRemovePOI(poi.id!)} // Use non-null assertion assuming temp ID exists
                  variant="text"
                  size="sm"
                  type="button"
                >
                  <Trash size={16} className="text-red-500" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-1">{poi.description}</p>
              <div className="text-xs text-gray-500">
                  Imagem: {renderFileInfo(poi.imageUrl, 'image') || 'Nenhuma'}
              </div>
              <div className="text-xs text-gray-500">
                  Áudio: {renderFileInfo(poi.audioUrl, 'audio') || 'Nenhum'}
              </div>
            </div>
          ))}

          {/* Add POI Form */}
          <div className="mt-4 p-4 border border-dashed rounded-md">
            <h4 className="font-medium mb-3">Adicionar Ponto Turístico</h4>
            <div className="space-y-3">
              <Input
                label="Nome"
                name="name"
                value={newPOI.name}
                onChange={handlePOIInputChange}
                fullWidth
              />
              <div>
                <label htmlFor="poi_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="poi_description"
                  name="description"
                  value={newPOI.description}
                  onChange={handlePOIInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <FileInput
                label="Imagem (opcional)"
                id="poi_imageUrl"
                accept="image/*"
                currentFile={newPOI.imageUrl}
                onChange={(e) => handlePOIFileChange(e, 'imageUrl')}
                icon={ImageIcon}
              />
              <FileInput
                label="Áudio (obrigatório)"
                id="poi_audioUrl"
                accept="audio/*"
                currentFile={newPOI.audioUrl}
                onChange={(e) => handlePOIFileChange(e, 'audioUrl')}
                icon={Music}
              />
              <Button
                onClick={handleAddPOI}
                size="sm"
                type="button"
                disabled={!newPOI.name || !newPOI.description || !newPOI.audioUrl}
              >
                <Plus size={16} className="mr-1" />
                Adicionar POI à Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 justify-end pt-4 border-t">
          <Button
            onClick={handleCancel}
            variant="outline"
            type="button"
            disabled={isLoading}
          >
            <X size={16} className="mr-1" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formState.name || !formState.country || !formState.description || !formState.imageUrl || !formState.introAudioUrl}
          >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
                <Check size={16} className="mr-1" />
            )}
            {editingDestinationId ? 'Salvar Alterações' : 'Adicionar Destino'}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <MapPin size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-800 font-heading">Área de Administração</h1>
        </div>
        <p className="text-gray-600">
          Gerencie destinos, pontos turísticos e seus respectivos áudios e fotos.
        </p>
      </div>

      {/* Destination List / Add Button */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Destinos</h2>
          {!isAddingDestination && !editingDestinationId && (
            <Button
              onClick={() => {
                  setIsAddingDestination(true);
                  setEditingDestinationId(null);
                  setFormState(initialFormState); // Ensure form is reset when adding
              }}
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              Adicionar Destino
            </Button>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && !isAddingDestination && !editingDestinationId && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error Display */} 
        {error && !isAddingDestination && !editingDestinationId && (
            <p className="text-red-500 text-center py-4">Erro ao carregar destinos: {error}</p>
        )}

        {/* Destination List */} 
        {!isLoading && !error && !isAddingDestination && !editingDestinationId && (
          <div className="space-y-4">
            {destinations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum destino encontrado.</p>
            ) : (
                destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg font-semibold">{destination.name}</h3>
                        <p className="text-gray-600">{destination.country}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {destination.pointsOfInterest.length} ponto(s) turístico(s)
                        </p>
                        <p className="text-sm text-gray-500">
                          Preço: €{destination.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEditDestination(destination)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit size={16} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDeleteDestination(destination.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash size={16} className="mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Add/Edit Form Display */} 
        {(isAddingDestination || editingDestinationId) && FormComponent}

      </div>
    </div>
  );
};

export default AdminPage;

