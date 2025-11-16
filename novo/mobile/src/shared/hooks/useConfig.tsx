import { useMemo } from 'react';

export type Configuration = {
  SERVER_URL: string;
};

export const useConfig = (): Configuration => {
  return useMemo(
    () => ({
      SERVER_URL: 'http://localhost:8000',
    }),
    [],
  );
};
