import type { ClientConfig } from '../types';

/** current: bu olaydaki oturum anahtarı; token(): gerekirse yenilenmiş güncel anahtar. */
export interface AuthUser { email: string; current: string; token: () => Promise<string | null>; }
export interface AuthController {
  /** recovery: kullanıcı şifre yenileme bağlantısıyla geldi; yeni şifre sorulmalı. */
  subscribe: (callback: (user: AuthUser | null, recovery: boolean) => void) => () => void;
  login: (email: string, password: string) => Promise<void>;
  reset: (email: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/** Panel girişi Supabase Auth ile yapılır. Oturum bu cihazda saklanır; yer imi yeni sekme açtığında yeniden giriş gerekmez. */
export async function createAuth(config: NonNullable<ClientConfig['auth']>): Promise<AuthController> {
  const { createClient } = await import('@supabase/supabase-js');
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'ka-emlak-admin' } });
  const fail = (error: unknown) => { if (error) throw error; };
  return {
    subscribe: callback => {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        // Süresi dolmak üzere olan anahtarı getSession kendiliğinden yeniler.
        callback(session?.user ? { email: session.user.email ?? '', current: session.access_token, token: async () => (await client.auth.getSession()).data.session?.access_token ?? null } : null, event === 'PASSWORD_RECOVERY');
      });
      return () => data.subscription.unsubscribe();
    },
    login: async (email, password) => fail((await client.auth.signInWithPassword({ email: email.trim(), password })).error),
    reset: async email => fail((await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/yonetim` })).error),
    setPassword: async password => fail((await client.auth.updateUser({ password })).error),
    logout: async () => fail((await client.auth.signOut({ scope: 'local' })).error),
  };
}

export function authError(error: unknown) {
  const { code, status, message } = (error ?? {}) as { code?: string; status?: number; message?: string };
  if (code === 'invalid_credentials' || code === 'user_not_found') return 'E-posta veya şifre doğru değil. Bilgilerinizi kontrol edin.';
  if (code === 'email_not_confirmed') return 'Bu e-posta adresi henüz onaylanmamış. Supabase panelinden kullanıcıyı onaylayın.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || status === 429) return 'Çok fazla deneme yapıldı. Biraz bekleyip yeniden deneyin.';
  if (code === 'weak_password') return 'Şifre çok kısa ya da kolay. En az 8 karakterli, tahmin edilmesi zor bir şifre seçin.';
  if (code === 'same_password') return 'Yeni şifre eskisiyle aynı olamaz.';
  if (code === 'validation_failed' || code === 'email_address_invalid') return 'Geçerli bir e-posta adresi yazın.';
  if (status === 0 || /fetch|network/i.test(message ?? '')) return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.';
  return 'Giriş işlemi tamamlanamadı. Lütfen yeniden deneyin.';
}
