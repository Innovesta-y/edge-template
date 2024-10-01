import { createClient } from "jsr:@supabase/supabase-js@2";

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
  // Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);


// 認証チェック用の関数
export async function isAuthenticated(req: { headers: { get: (arg0: string) => string | null; }; }) {
  // AuthorizationヘッダーからJWTトークンを取得
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  // JWTトークンをログに出力（デバッグ用）
  // console.log('JWT Token:', jwt);

  // JWTトークンがない場合は認証失敗
  if (!jwt) {
    console.error('No jwt found');
    return false;
  }

  // JWTトークンからユーザー情報を取得
   const { data: { user }, error } = await supabase.auth.getUser(jwt);
   if (error) {
     console.error('Error fetching user:', error);
     return false;
   }
   // console.log('User:', user);

  // 認証されている場合はtrueを返す
  return user?.id ? true : false;
}
