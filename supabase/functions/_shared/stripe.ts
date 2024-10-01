import Stripe from 'npm:stripe';
// import Stripe from "npm:stripe@^16.9.0"

// Stripeインスタンスの作成
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20', // APIバージョンの指定
    maxNetworkRetries: 2, // リトライ設定：ネットワークリクエストが失敗した場合、2回リトライ
    httpClient: Stripe.createFetchHttpClient(), // Fetch APIを使用してDeno環境に適応
  });
