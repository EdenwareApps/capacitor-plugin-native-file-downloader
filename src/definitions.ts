export interface NativeFileDownloaderPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
