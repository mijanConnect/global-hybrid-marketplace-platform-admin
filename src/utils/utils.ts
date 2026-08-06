import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  
  let baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  // Strip /api/v1 or similar from the base URL for static assets
  baseUrl = baseUrl.replace(/\/api\/v\d+\/?$/, "");
  
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
