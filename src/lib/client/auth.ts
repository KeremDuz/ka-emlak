import type { Auth, User } from 'firebase/auth';
import type { ClientConfig } from '../types';

export interface AuthController {
  auth: Auth;
  subscribe: (callback: (user: User | null) => void) => () => void;
  login: (email: string, password: string) => Promise<unknown>;
  reset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}
export async function createAuth(config: NonNullable<ClientConfig['firebase']>): Promise<AuthController> {
  const [appSdk, authSdk] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  const app = appSdk.getApps().find(app => app.name === 'ka-emlak-admin') || appSdk.initializeApp(config, 'ka-emlak-admin');
  const auth = authSdk.getAuth(app);
  await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);
  return {
    auth,
    subscribe: callback => authSdk.onAuthStateChanged(auth, callback),
    login: (email, password) => authSdk.signInWithEmailAndPassword(auth, email.trim(), password),
    reset: email => authSdk.sendPasswordResetEmail(auth, email.trim()),
    logout: () => authSdk.signOut(auth),
  };
}
export function authError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'E-posta veya şifre doğru değil. Bilgilerinizi kontrol edin.';
  if (code === 'auth/too-many-requests') return 'Çok fazla deneme yapıldı. Biraz bekleyip yeniden deneyin.';
  if (code === 'auth/network-request-failed') return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.';
  if (code === 'auth/invalid-email') return 'Geçerli bir e-posta adresi yazın.';
  return 'Giriş işlemi tamamlanamadı. Lütfen yeniden deneyin.';
}
