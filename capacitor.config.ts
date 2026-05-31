import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor wraps the built web app (dist/) into native Android & iOS projects.
// Build the web bundle for mobile first:  BUILD_TARGET=mobile npm run build
// Then:  npx cap add android  /  npx cap add ios  →  npx cap sync
const config: CapacitorConfig = {
  appId: 'pl.ainauczyciel.app',
  appName: 'AI Nauczyciel',
  webDir: 'dist',
  backgroundColor: '#0b1020',
  android: {
    backgroundColor: '#0b1020',
  },
  ios: {
    backgroundColor: '#0b1020',
    contentInset: 'always',
  },
};

export default config;
