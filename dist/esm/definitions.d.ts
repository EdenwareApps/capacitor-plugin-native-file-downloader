export interface ScheduleFileDownloadOptions {
    /**
     * Url of the file to be downloaded.
     * e.g. https://example.com/downloads/file.pdf
     */
    url: string;
    /**
     * Name of the downloaded file (including extension).
     * e.g. my-file.pdf
     */
    fileName: string;
}
export interface ScheduleFileDownloadResult {
    /**
     * The internal identifier of scheduled download process.
     */
    downloadId?: string;
}
export interface NativeFileDownloaderPlugin {
    /**
     * Schedule file to be downloaded.
     * Returned Promise resolves when the download is scheduled (not when download completes).
     */
    scheduleFileDownload(options: ScheduleFileDownloadOptions): Promise<ScheduleFileDownloadResult>;
}
