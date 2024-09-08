import { WebPlugin } from '@capacitor/core';
export class NativeFileDownloaderWeb extends WebPlugin {
    async scheduleFileDownload(options) {
        const a = document.createElement('a');
        a.href = options.url;
        a.download = options.fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return {
            downloadId: undefined,
        };
    }
}
//# sourceMappingURL=web.js.map