# capacitor-plugin-native-file-downloader

Capacitor plugin for downloading files using native apis. Currently available only on web and Android.

## Install

```bash
npm install capacitor-plugin-native-file-downloader
npx cap sync
```

## API

<docgen-index>

* [`scheduleFileDownload(...)`](#schedulefiledownload)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### scheduleFileDownload(...)

```typescript
scheduleFileDownload(options: FileDownloadOptions) => Promise<FileDownloadResponse>
```

| Param         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#filedownloadoptions">FileDownloadOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#filedownloadresponse">FileDownloadResponse</a>&gt;</code>

--------------------


### Interfaces


#### FileDownloadResponse

| Prop             | Type                |
| ---------------- | ------------------- |
| **`downloadId`** | <code>string</code> |


#### FileDownloadOptions

| Prop           | Type                |
| -------------- | ------------------- |
| **`url`**      | <code>string</code> |
| **`fileName`** | <code>string</code> |

</docgen-api>
