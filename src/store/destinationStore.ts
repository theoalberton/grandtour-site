import { create } from 'zustand';
import { Destination, PointOfInterest } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in environment variables.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Define correct bucket names
const PHOTO_BUCKET = 'destination-photos';
const AUDIO_BUCKET = 'destination-audios';

// Helper function to upload a file and return its public URL
const uploadFile = async (bucket: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error(`Error uploading file to ${bucket}:`, uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
      throw new Error(`Failed to get public URL for uploaded file in ${bucket}`);
  }

  return data.publicUrl;
};

// Type for data passed to add/update functions, allowing File or string URL
type DestinationInputData = Omit<Destination, 'id' | 'tourCount' | 'imageUrl' | 'introAudioUrl' | 'pointsOfInterest'> & {
    imageUrl?: File | string | null;
    introAudioUrl?: File | string | null;
    pointsOfInterest: Array<Omit<PointOfInterest, 'id' | 'imageUrl' | 'audioUrl'> & {
        id?: string; // Optional ID for existing POIs during update
        imageUrl?: File | string | null;
        audioUrl?: File | string | null;
    }>;
};

interface DestinationState {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  fetchDestinations: () => Promise<void>;
  getDestination: (id: string) => Destination | undefined;
  addDestination: (destinationData: DestinationInputData) => Promise<void>;
  updateDestination: (id: string, destinationData: DestinationInputData) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;
}

// Helper function to map Supabase data to Destination type
const mapSupabaseToDestination = (dest: any, pois: any[]): Destination => ({
  id: dest.id.toString(),
  name: dest.name,
  country: dest.country,
  description: dest.description,
  imageUrl: dest.image_url,
  introAudioUrl: dest.intro_audio_url,
  price: dest.price,
  tourCount: pois.length,
  pointsOfInterest: pois.map(poi => ({
    id: poi.id.toString(),
    name: poi.name,
    description: poi.description,
    imageUrl: poi.image_url,
    audioUrl: poi.audio_url,
  })),
});

export const useDestinationStore = create<DestinationState>((set, get) => ({
  destinations: [],
  isLoading: false,
  error: null,

  fetchDestinations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations')
        .select('*');
      if (destinationsError) throw destinationsError;

      const { data: poisData, error: poisError } = await supabase
        .from('points_of_interest')
        .select('*');
      if (poisError) throw poisError;

      const mappedDestinations = destinationsData.map(dest => {
        const relatedPois = poisData.filter(poi => poi.destination_id === dest.id);
        return mapSupabaseToDestination(dest, relatedPois);
      });

      set({ destinations: mappedDestinations, isLoading: false });
    } catch (error) {
      console.error("Error fetching destinations:", error);
      set({ error: error instanceof Error ? error.message : 'Erro ao buscar destinos', isLoading: false });
    }
  },

  getDestination: (id: string) => {
    return get().destinations.find(destination => destination.id === id);
  },

  addDestination: async (destinationData) => {
    set({ isLoading: true, error: null });
    try {
      let finalImageUrl: string | null = null;
      if (destinationData.imageUrl instanceof File) {
        finalImageUrl = await uploadFile(PHOTO_BUCKET, destinationData.imageUrl); // Use correct bucket name
      } else if (typeof destinationData.imageUrl === 'string') {
        finalImageUrl = destinationData.imageUrl; // Allow direct URL if provided
      }

      let finalIntroAudioUrl: string | null = null;
      if (destinationData.introAudioUrl instanceof File) {
        finalIntroAudioUrl = await uploadFile(AUDIO_BUCKET, destinationData.introAudioUrl); // Use correct bucket name
      } else if (typeof destinationData.introAudioUrl === 'string') {
        finalIntroAudioUrl = destinationData.introAudioUrl;
      }

      // 1. Insert Destination
      const { data: newDestData, error: insertDestError } = await supabase
        .from('destinations')
        .insert({
          name: destinationData.name,
          country: destinationData.country,
          description: destinationData.description,
          image_url: finalImageUrl,
          intro_audio_url: finalIntroAudioUrl,
          price: destinationData.price,
        })
        .select()
        .single();

      if (insertDestError) throw insertDestError;
      const newDestinationId = newDestData.id;

      // 2. Upload POI files and Insert Points of Interest
      if (destinationData.pointsOfInterest && destinationData.pointsOfInterest.length > 0) {
        const poisToInsert = await Promise.all(destinationData.pointsOfInterest.map(async (poi) => {
          let poiImageUrl: string | null = null;
          if (poi.imageUrl instanceof File) {
            poiImageUrl = await uploadFile(PHOTO_BUCKET, poi.imageUrl); // Use correct bucket name
          } else if (typeof poi.imageUrl === 'string') {
            poiImageUrl = poi.imageUrl;
          }

          let poiAudioUrl: string | null = null;
          if (poi.audioUrl instanceof File) {
            poiAudioUrl = await uploadFile(AUDIO_BUCKET, poi.audioUrl); // Use correct bucket name
          } else if (typeof poi.audioUrl === 'string') {
            poiAudioUrl = poi.audioUrl;
          }

          if (!poiAudioUrl) {
              throw new Error(`Audio is required for POI: ${poi.name}`);
          }

          return {
            destination_id: newDestinationId,
            name: poi.name,
            description: poi.description,
            image_url: poiImageUrl,
            audio_url: poiAudioUrl,
          };
        }));

        const { error: insertPoiError } = await supabase
          .from('points_of_interest')
          .insert(poisToInsert);

        if (insertPoiError) {
          console.error("Error inserting POIs, attempting rollback:", insertPoiError);
          // Attempt to rollback destination and potentially uploaded files (complex)
          await supabase.from('destinations').delete().eq('id', newDestinationId);
          // TODO: Consider deleting uploaded files from storage on failure
          throw insertPoiError;
        }
      }

      await get().fetchDestinations(); // Refetch to update state

    } catch (error) {
      console.error("Error adding destination:", error);
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar destino', isLoading: false });
      // Optionally re-throw or handle UI feedback
    }
  },

  updateDestination: async (id, destinationData) => {
    set({ isLoading: true, error: null });
    const destinationId = parseInt(id, 10);
    if (isNaN(destinationId)) {
        set({ error: 'ID de destino inválido', isLoading: false });
        return;
    }

    try {
      // Fetch existing destination to compare files if needed (optional, for deleting old files)
      // const existingDestination = get().destinations.find(d => d.id === id);

      let finalImageUrl: string | undefined | null = destinationData.imageUrl;
      if (destinationData.imageUrl instanceof File) {
        // TODO: Optionally delete old image from storage if existingDestination.imageUrl exists
        finalImageUrl = await uploadFile(PHOTO_BUCKET, destinationData.imageUrl); // Use correct bucket name
      } // If null or string, keep as is

      let finalIntroAudioUrl: string | undefined | null = destinationData.introAudioUrl;
      if (destinationData.introAudioUrl instanceof File) {
        // TODO: Optionally delete old audio from storage
        finalIntroAudioUrl = await uploadFile(AUDIO_BUCKET, destinationData.introAudioUrl); // Use correct bucket name
      } // If null or string, keep as is

      // 1. Update Destination details
      const { error: updateDestError } = await supabase
        .from('destinations')
        .update({
          name: destinationData.name,
          country: destinationData.country,
          description: destinationData.description,
          image_url: finalImageUrl,
          intro_audio_url: finalIntroAudioUrl,
          price: destinationData.price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', destinationId);

      if (updateDestError) throw updateDestError;

      // 2. Handle Points of Interest (Delete existing, Upload new files, Insert new POIs)
      // 2a. Delete existing POIs for this destination
      // TODO: Before deleting POIs, get their storage URLs to delete files later
      const { error: deletePoiError } = await supabase
        .from('points_of_interest')
        .delete()
        .eq('destination_id', destinationId);

      if (deletePoiError) throw deletePoiError;
      // TODO: Delete old POI files from storage here

      // 2b. Upload new POI files and Insert new POIs
      if (destinationData.pointsOfInterest && destinationData.pointsOfInterest.length > 0) {
        const poisToInsert = await Promise.all(destinationData.pointsOfInterest.map(async (poi) => {
          let poiImageUrl: string | undefined | null = poi.imageUrl;
          if (poi.imageUrl instanceof File) {
            poiImageUrl = await uploadFile(PHOTO_BUCKET, poi.imageUrl); // Use correct bucket name
          }

          let poiAudioUrl: string | undefined | null = poi.audioUrl;
          if (poi.audioUrl instanceof File) {
            poiAudioUrl = await uploadFile(AUDIO_BUCKET, poi.audioUrl); // Use correct bucket name
          }

          if (!poiAudioUrl) {
              throw new Error(`Audio is required for POI: ${poi.name}`);
          }

          return {
            destination_id: destinationId,
            name: poi.name,
            description: poi.description,
            image_url: poiImageUrl,
            audio_url: poiAudioUrl,
          };
        }));

        const { error: insertPoiError } = await supabase
          .from('points_of_interest')
          .insert(poisToInsert);

        if (insertPoiError) throw insertPoiError; // Consider more robust error handling/rollback
      }

      await get().fetchDestinations(); // Refetch to update state

    } catch (error) {
      console.error("Error updating destination:", error);
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar destino', isLoading: false });
    }
  },

  deleteDestination: async (id) => {
    set({ isLoading: true, error: null });
    const destinationId = parseInt(id, 10);
    if (isNaN(destinationId)) {
        set({ error: 'ID de destino inválido', isLoading: false });
        return;
    }

    try {
      // TODO: Before deleting destination, get all associated file URLs from DB
      // (destinations.image_url, destinations.intro_audio_url, points_of_interest.image_url, points_of_interest.audio_url)

      // Delete destination (Cascade delete handles POIs in DB)
      const { error: deleteError } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destinationId);

      if (deleteError) throw deleteError;

      // TODO: Delete associated files from Supabase Storage here

      // Update state locally
      set(state => ({
        destinations: state.destinations.filter(destination => destination.id !== id),
        isLoading: false,
      }));

    } catch (error) {
      console.error("Error deleting destination:", error);
      set({ error: error instanceof Error ? error.message : 'Erro ao excluir destino', isLoading: false });
    }
  },
}));

// Install uuid: npm install uuid @types/uuid

