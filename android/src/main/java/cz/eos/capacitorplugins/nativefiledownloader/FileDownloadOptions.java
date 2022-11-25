package cz.eos.capacitorplugins.nativefiledownloader;

import android.os.Environment;

import com.getcapacitor.PluginCall;

import java.io.File;

class FileDownloadOptions {
    private final File downloadsDirectory = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
    private final String url;
    private final String fileName;

    public FileDownloadOptions(PluginCall call) {
        this.url = call.getString("url");
        this.fileName = call.getString("fileName");
    }

    String getUrl() {
        return this.url;
    }

    String getFileName() {
        return this.fileName;
    }

    File getDownloadDestination() {
        return new File(this.downloadsDirectory, this.fileName);
    }
}
