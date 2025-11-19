// types/utils.ts

// Util types réutilisables pour renforcer le typage strict
export type ApiResponse<T> = {
  data: T;
  error?: string | null;
};

export type Nullable<T> = T | null | undefined;

// Useful deep partial (simple version)
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Runtime helpers pour améliorer la sûreté lors du parsing JSON et des catch
export function isError(e: unknown): e is Error {
  return typeof e === 'object' && e !== null && 'message' in e && typeof (e as any).message === 'string'
}

// H3 / Nitro error shape helper (lightweight)
export type H3Error = Error & { statusCode?: number; statusMessage?: string };
export function isH3Error(e: unknown): e is H3Error {
  return typeof e === 'object' && e !== null && 'statusCode' in e
}
export function safeParseJson<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T
  } catch {
    return null
  }
}

export function parseJsonArray<T>(input: string): T[] {
  const parsed = safeParseJson<unknown>(input)
  return Array.isArray(parsed) ? (parsed as T[]) : []
}

