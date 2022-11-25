import { registerPlugin } from '@capacitor/core';

import type { NativeFileDownloaderPlugin } from './definitions';

const NativeFileDownloader = registerPlugin<NativeFileDownloaderPlugin>(
  'NativeFileDownloader',
  {
    web: () => import('./web').then(m => new m.NativeFileDownloaderWeb()),
  },
);

export * from './definitions';
export { NativeFileDownloader };
