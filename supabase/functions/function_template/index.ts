// 機能名: template_function_name
//
// 内容: Supabase Edge Functions Template
// 利用API: Resend API

// 認証： ユーザー認証必須

// リクエストボディ例（JSON）
// {"email":"test@email.com"}

import { supabase, isAuthenticated } from "../_shared/supabase.ts";
import { corsHeaders } from '../_shared/cors.ts'

const fromAddress = 'noreply@email.com'
const fromName = 'Template'

Deno.serve(async (req) => {

  // ブラウザからの事前確認をパス
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // ユーザー認証チェック
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // RESEND API KEY
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key is missing in environment variables');
    }

    // リクエストボディからtoUserId, subject, bodyを取得
    const { toUserId, subject, bodyHtml } = await req.json();

    // 必須パラメータチェック
    if (!toUserId || !subject || !bodyHtml) {
      throw new Error('to, subject, and body are required');
    }

    // Supabaseからユーザーのメールアドレスを取得
    const { data: toAddressData, error: addressError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", toUserId)
    .single();
    if (addressError || !toAddressData) {
    throw new Error('No user found or an error occurred while fetching the email address');
    }
    const toAddress = toAddressData.email;

    // Resend APIを使用してメールを送信
    const emailBody = {
      from: `${fromName} <${fromAddress}>`, // 送信者のメールアドレス
      to: toAddress,                         // 受信者のメールアドレス
      subject: subject,               // 件名
      html: `<p>${bodyHtml}</p>`          // メール本文
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });

    if (!resendResponse.ok) {
      const errorResponse = await resendResponse.json();
      throw new Error(`Resend API error: ${errorResponse.message}`);
    }

    // 成功レスポンスを返す
    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error occurred:', error);

    // エラーレスポンスをまとめて返す
    return new Response(
      JSON.stringify({
        title: 'エラーが発生しました',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=UTF-8' },
        status: 400
      }
    );
  }
});