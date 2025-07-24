// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore: apiVersion literal peut ne pas correspondre au union type généré
  apiVersion: '2024-06-20',
});

export const createPaymentIntent = async (
  amount: number,
  clientId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // montant en cents
      currency: 'eur',
      metadata: { clientId },
    });
    return { paymentIntent, error: null };
  } catch (err: any) {
    return { paymentIntent: null, error: err.message || 'Erreur Stripe' };
  }
};

export default stripe;
