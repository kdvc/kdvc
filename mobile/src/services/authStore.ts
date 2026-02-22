import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../hooks/useLogin';

export const STORAGE_KEYS = {
  USER: 'user',
  ROLE: 'userRole',
  ACCESS_TOKEN: '@kdvc/access_token',
  REFRESH_TOKEN: '@kdvc/refresh_token',
  CURRENT_USER: '@kdvc/current_user',
};

let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Hydrate in-memory tokens from AsyncStorage (call once on app start) */
export async function loadTokens() {
  accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export async function getCurrentUser(): Promise<User | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return json ? JSON.parse(json) : null;
}

export async function setTokens(user: User, access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ROLE, user.role],
    [STORAGE_KEYS.ACCESS_TOKEN, access],
    [STORAGE_KEYS.REFRESH_TOKEN, refresh],
    [STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)],
  ]);
}

export async function updateCurrentUser(user: User) {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.CURRENT_USER,
    STORAGE_KEYS.ROLE,
  ]);
}
