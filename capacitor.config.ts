import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tomatoclock.app',
  appName: '简智-番茄钟',
  webDir: 'dist',
  server: {
    // Allow navigation to external URLs (Supabase, R2, etc.)
    androidScheme: 'https'
  },
  ios: {
    // iOS specific configuration
    contentInset: 'automatic',
    allowsLinkPreview: false,
    // Enable background audio
    backgroundMode: ['audio']
  }
};

export default config;
