import { invoke } from "@tauri-apps/api/core";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const API_BASE_STORAGE_KEY = "hotspotApiBaseUrl";

declare global {
  interface Window {
    __HOTSPOT_API_BASE_URL__?: string;
  }
}

const normalizeApiBaseUrl = (url: string) => url.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const runtimeApiBaseUrl =
    typeof window !== "undefined" ? window.__HOTSPOT_API_BASE_URL__ : "";
  const savedApiBaseUrl =
    typeof window !== "undefined" ? localStorage.getItem(API_BASE_STORAGE_KEY) : "";
  const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return normalizeApiBaseUrl(
    runtimeApiBaseUrl || savedApiBaseUrl || envApiBaseUrl || DEFAULT_API_BASE_URL,
  );
};

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem(API_BASE_STORAGE_KEY, normalizeApiBaseUrl(url));
};

export const initializeApiBaseUrl = async () => {
  try {
    const runtimeApiBaseUrl = await invoke<string>("get_api_base_url");

    if (runtimeApiBaseUrl) {
      setApiBaseUrl(runtimeApiBaseUrl);
    }
  } catch {
    // Browser dev mode or older Tauri builds can fall back to env/localStorage/default.
  }
};

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export const mediaImageUrl = (path: string) => {
  if (!path) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  return apiUrl(`/media/image?path=${encodeURIComponent(path)}`);
};

export const mediaVideoUrl = (path: string) => {
  if (!path) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  return apiUrl(`/media/video?path=${encodeURIComponent(path)}`);
};
