/**
 * @file config.ts
 * @description Centralna konfiguracja aplikacji frontendowej (URL backendu, feature toggles, etc.)
 */

export const config = {
  apiUrl: process.env.API_URL ?? 'http://localhost:5000',
  // Możesz tu dodać więcej:
  // appName: 'Modulon',
  // defaultLocale: 'pl',
  // enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true',
};
