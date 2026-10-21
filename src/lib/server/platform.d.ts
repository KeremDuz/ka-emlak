// Runtime module has no local database/storage bindings; settings are read and validated per request.
declare module 'cloudflare:workers' { export const env: Record<string,unknown>; }
