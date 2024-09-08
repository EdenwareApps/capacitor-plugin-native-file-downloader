import { registerPlugin } from '@capacitor/core';
const NativeFileDownloader = registerPlugin('NativeFileDownloader', {
    web: () => import('./web').then(m => new m.NativeFileDownloaderWeb()),
});
export * from './definitions';
export { NativeFileDownloader };
//# sourceMappingURL=index.js.map