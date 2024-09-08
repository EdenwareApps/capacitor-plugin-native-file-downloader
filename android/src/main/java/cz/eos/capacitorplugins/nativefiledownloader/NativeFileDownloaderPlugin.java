package cz.eos.capacitorplugins.nativefiledownloader;

import android.Manifest;
import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "NativeFileDownloader",
    permissions = {
        @Permission(alias = "storage", strings = { Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE })
    }
)
public class NativeFileDownloaderPlugin extends Plugin {

    @PluginMethod
    public void scheduleFileDownload(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionsCallback");
        } else {
            this.downloadFile(call);
        }
    }

    @PermissionCallback
    private void storagePermissionsCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q || getPermissionState("storage") == PermissionState.GRANTED) {
            this.downloadFile(call);
        } else {
            call.reject("PERMISSION_REQUIRED");
        }
    }

    private void downloadFile(PluginCall call) {
        FileDownloadOptions options = new FileDownloadOptions(call);

        DownloadManager downloadManager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        long downloadId = downloadManager.enqueue(this.createDownloadRequest(options));

        JSObject result = new JSObject();
        result.put("downloadId", downloadId);
        call.resolve(result);
    }

    private DownloadManager.Request createDownloadRequest(FileDownloadOptions options) {
        return new DownloadManager.Request(Uri.parse(options.getUrl()))
            .setTitle(options.getFileName())
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setAllowedOverRoaming(false)
            .setAllowedOverMetered(true)
            .setDestinationUri(Uri.fromFile(options.getDownloadDestination()));
    }
}
