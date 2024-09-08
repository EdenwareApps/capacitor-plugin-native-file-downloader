import { WebPlugin } from '@capacitor/core';
import type { NativeFileDownloaderPlugin, ScheduleFileDownloadOptions, ScheduleFileDownloadResult } from './definitions';
export declare class NativeFileDownloaderWeb extends WebPlugin implements NativeFileDownloaderPlugin {
    scheduleFileDownload(options: ScheduleFileDownloadOptions): Promise<ScheduleFileDownloadResult>;
}
