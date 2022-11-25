export interface FileDownloadOptions {
  url: string;
  fileName: string;
}
export interface FileDownloadResponse {
  downloadId?: string;
}

export interface NativeFileDownloaderPlugin {
  scheduleFileDownload(options: FileDownloadOptions): Promise<FileDownloadResponse>;
}
