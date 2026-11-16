import { afterEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../src/lib/server/database';
import type { ServerLocals } from '../src/lib/server/env';

const locals: ServerLocals = { env: { SUPABASE_URL: 'https://proje.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test' } };
afterEach(() => vi.unstubAllGlobals());

describe('Supabase request helper', () => {
  it('accepts an empty 201 reply from a "return=minimal" write', async () => {
    // Ayarlar ve iletişim formu kayıtları böyle yanıt alır; eskiden boş gövde JSON okunurken hata veriyordu.
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 201 })));
    await expect(supabase(locals, '/rest/v1/office_settings', { method: 'POST', body: '{}' })).resolves.toBeUndefined();
  });
  it('still returns the rows of a read', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ id: 'main' }]), { status: 200 })));
    await expect(supabase(locals, '/rest/v1/office_settings')).resolves.toEqual([{ id: 'main' }]);
  });
});
