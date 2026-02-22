import { getAccessToken } from './authStore';

// const BASE_URL = 'https://kdvc.ogustavo.dev';
const BASE_URL = 'http://192.168.1.106:8000'; // Machine's local network IP
// const BASE_URL = 'http://YOUR_LOCAL_IP:8000'; // Use this if testing on a physical device
// const BASE_URL = 'http://YOUR_LOCAL_IP:8000'; // Use this if testing on a physical device
// const BASE_URL = 'http://YOUR_LOCAL_IP:8000'; // Use this if testing on a physical device


type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

/**
 * Thin wrapper around fetch that automatically injects the
 * Authorization header from the auth store.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  console.log(
    'Making request to ' +
    (options.method ?? 'GET') +
    ' ' +
    `${BASE_URL}${path}`,
  );

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
