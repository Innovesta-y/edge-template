import Stripe from 'npm:stripe';

// StripeのWebhookイベントを検証
export async function verifyStripeSignature(request: Request): Promise<Stripe.Event> {
  const signature = request.headers.get('Stripe-Signature');
  const body = await request.text();
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  try {
    const event = await Stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    );
    return event as Stripe.Event;
  } catch (err) {
    console.error('Error verifying Stripe signature:', err.message);
    throw new Error('Invalid Stripe signature');
  }
}