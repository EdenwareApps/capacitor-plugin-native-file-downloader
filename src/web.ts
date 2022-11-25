import { WebPlugin } from '@capacitor/core';

import type { NativeFileDownloaderPlugin , FileDownloadOptions, FileDownloadResponse } from './definitions';

export class NativeFileDownloaderWeb
  extends WebPlugin
  implements NativeFileDownloaderPlugin
{
  async scheduleFileDownload(options: FileDownloadOptions): Promise<FileDownloadResponse> {
    const a = document.createElement('a');
    a.href = options.url;
    a.download = options.fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return {
      downloadId: undefined
    }
  }
}
