'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const NativeFileDownloader = core.registerPlugin('NativeFileDownloader', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.NativeFileDownloaderWeb()),
});

class NativeFileDownloaderWeb extends core.WebPlugin {
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    NativeFileDownloaderWeb: NativeFileDownloaderWeb
});

exports.NativeFileDownloader = NativeFileDownloader;
//# sourceMappingURL=plugin.cjs.js.map
