import React, { useCallback, useState } from 'react'; // Added React import
import { useAuthStore } from '../store/authStore'; // Import authStore to get the token
import { STRIPE_PRODUCTS } from '../stripe-config';

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export function useStripe() {
  // Get the session from the auth store
  const session = useAuthStore((state) => state.session);
  const [isLoading, setIsLoading] = useState(false); // Use useState directly now

  const createCheckoutSession = useCallback(async (priceId: string, mode: 'payment' | 'subscription', destinationId: string) => {
    // Check if user is logged in by verifying the session
    if (!session?.access_token) {
        console.error('User not authenticated. Cannot create checkout session.');
        throw new Error('Utilizador não autenticado.');
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use the user's access token for authorization
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/destinations/${destinationId}`, // Redirect back to destination on cancel
          mode,
          // Optionally pass metadata like user_id or destination_id if needed by the function
          metadata: {
              supabase_user_id: session.user.id,
              destination_id: destinationId,
          }
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to create checkout session:', response.status, errorBody);
        throw new Error(`Falha ao criar sessão de checkout: ${response.statusText} - ${errorBody}`);
      }

      const data = (await response.json()) as CreateCheckoutSessionResponse;

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        throw new Error('URL de checkout não recebida da função.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false); // Stop loading on error
      throw error; // Re-throw the error to be caught by the caller
    } 
    // No need to set isLoading to false on success, as the page redirects

  }, [session]); // Depend on session

  const purchaseGrandTour = useCallback(async (destinationName: string, price: number, destinationId: string) => {
      // TODO: Ideally, the priceId should come from the destination data or a config mapping
      // For now, assuming a single product/price defined in stripe-config
      if (!STRIPE_PRODUCTS.GRAND_TOUR) {
          throw new Error('Configuração do produto Stripe GRAND_TOUR não encontrada.');
      }
      await createCheckoutSession(STRIPE_PRODUCTS.GRAND_TOUR.priceId, STRIPE_PRODUCTS.GRAND_TOUR.mode, destinationId);
  }, [createCheckoutSession]);

  return {
    purchaseGrandTour,
    isLoading, // Expose loading state
  };
}

