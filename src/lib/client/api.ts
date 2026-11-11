import type { AdminListing, ClientConfig, Inquiry, OfficeSettings, Photo } from '../types';

let tokenProvider: (() => Promise<string | null>) | null = null;
export function setTokenProvider(provider: (() => Promise<string | null>) | null) { tokenProvider = provider; }
export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); this.name = 'ApiError'; }
}
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = await tokenProvider?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(data?.error?.message || data?.error || data?.message || 'İşlem tamamlanamadı. Lütfen yeniden deneyin.', response.status, data);
  }
  return data as T;
}
const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
export interface StorageUsage { usedBytes: number; reservedBytes?: number; limitBytes: number; warning: boolean; blocked: boolean; }
export type ListingAction = 'publish' | 'archive' | 'sold' | 'rented' | 'trash' | 'restore' | 'duplicate' | 'feature' | 'price';
export const adminApi = {
  config: () => request<ClientConfig>('/api/config'),
  preview: () => request<{ ok: boolean }>('/api/admin/session', json('POST', { preview: true })),
  /** Oturum çerezini kurar; yayınlanmamış ilan fotoğrafları <img> ile ancak bu çerezle açılır. */
  session: (token: string) => request<{ ok: boolean }>('/api/admin/session', json('POST', { token })),
  logout: () => request('/api/admin/session', json('DELETE')),
  listings: () => request<{ listings: AdminListing[] }>('/api/admin/listings'),
  create: () => request<{ listing: AdminListing }>('/api/admin/listings', json('POST', {})),
  save: (id: string, listing: unknown, version: number) => request<{ listing: AdminListing }>(`/api/admin/listings/${encodeURIComponent(id)}`, json('PUT', { listing, version })),
  action: (item: AdminListing, action: ListingAction, price?: number | null) => request<{ listing: AdminListing }>(`/api/admin/listings/${encodeURIComponent(item.id)}/action`, json('POST', { action, version: item.version, ...(action === 'price' ? { price } : {}) })),
  remove: (item: AdminListing) => request(`/api/admin/listings/${encodeURIComponent(item.id)}`, json('DELETE', { version: item.version })),
  settings: () => request<{ settings: OfficeSettings }>('/api/admin/settings'),
  saveSettings: (settings: OfficeSettings) => request<{ settings: OfficeSettings }>('/api/admin/settings', json('PUT', { settings })),
  inquiries: () => request<{ inquiries: Inquiry[] }>('/api/admin/inquiries'),
  updateInquiry: (id: string, status: Inquiry['status']) => request('/api/admin/inquiries', json('PATCH', { id, status })),
  storage: () => request<StorageUsage>('/api/admin/storage'),
  upload: (listingId: string, file: File) => {
    const data = new FormData(); data.append('listingId', listingId); data.append('file', file);
    return request<{ photo: Photo }>('/api/admin/upload', { method: 'POST', body: data });
  },
  removePhoto: (id: string) => request(`/api/admin/upload/${encodeURIComponent(id)}`, json('DELETE')),
  export: () => request<Record<string, unknown>>('/api/admin/export'),
  sourceListing: (source: unknown) => request<{ listing: AdminListing; created: boolean; photos: string[] }>('/api/admin/source/listing', json('POST', source)),
  sourcePhoto: (listingId: string, url: string) => request<{ photo: Photo }>('/api/admin/source/photo', json('POST', { listingId, url })),
  import: (data: unknown) => request<{ imported?: number; count?: number }>('/api/admin/import', json('POST', data)),
};
export function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) return 'Bu ilan başka bir sekmede güncellendi. Değişiklikleriniz korunuyor; güncel sürümü yükleyip karşılaştırın.';
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return 'Oturumunuzun bu işlem için yetkisi yok. Yeniden giriş yapın.';
  if (!navigator.onLine) return 'İnternet bağlantısı yok. Metin değişiklikleriniz bu cihazda korunuyor.';
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu. Lütfen yeniden deneyin.';
}
export function downloadJson(data: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
