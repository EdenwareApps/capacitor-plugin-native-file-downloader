import { WebPlugin } from '@capacitor/core';

import type { NativeFileDownloaderPlugin } from './definitions';

export class NativeFileDownloaderWeb
  extends WebPlugin
  implements NativeFileDownloaderPlugin
{
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
