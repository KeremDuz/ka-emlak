import type { Listing } from '../types';
export interface Recovery { listing: Listing; version: number; savedAt: string; }
const key = (id: string) => `ka-emlak-draft-v1:${id}`;
export function readRecovery(id: string): Recovery | null {
  try {
    const data = JSON.parse(localStorage.getItem(key(id)) || 'null');
    return data?.listing?.id === id && typeof data.version === 'number' ? data : null;
  } catch { return null; }
}
export function writeRecovery(listing: Listing, version: number): boolean {
  try {
    localStorage.setItem(key(listing.id), JSON.stringify({ listing, version, savedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
}
export function clearRecovery(id: string) { try { localStorage.removeItem(key(id)); } catch {} }
