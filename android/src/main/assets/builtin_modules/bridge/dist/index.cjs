'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var events = require('events');
var process = require('process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var process__default = /*#__PURE__*/_interopDefaultLegacy(process);

class ChannelMessageCodec {
    static serialize(payload) {
        const eventName = payload.eventName;
        const args = payload.args;
        const eventMessage = JSON.stringify(args);
        const data = {
            eventName,
            eventMessage,
        };
        const channelMessage = JSON.stringify(data);
        return channelMessage;
    }
    static deserialize(channelMessage) {
        const data = JSON.parse(channelMessage);
        const eventName = data.eventName;
        const eventMessage = data.eventMessage;
        let args = [];
        if (eventMessage) {
            args = JSON.parse(eventMessage);
        }
        const payload = {
            eventName,
            args,
        };
        return payload;
    }
}

class NativeMobileBridge {
    constructor() {
        this.mobileBridge = process__default["default"]._linkedBinding('nativeBridge');
    }
    emit(args) {
        this.mobileBridge.emit(args.channelName, args.channelMessage);
    }
    registerChannel(channelName, callback) {
        this.mobileBridge.registerChannel(channelName, (channelName, channelMessage) => {
            callback({ channelName, channelMessage });
        });
    }
}
class NativeDesktopBridge {
    emit(args) {
        if (!process__default["default"].send) {
            throw new Error('No IPC channel has been established between the Node.js process and the Capacitor layer.');
        }
        process__default["default"].send(args);
    }
    registerChannel(channelName, callback) {
        process__default["default"].on('message', (args) => {
            if (args.channelName === channelName) {
                callback(args);
            }
        });
    }
}
const platform = process__default["default"].platform;
const isMobilePlatform = platform === 'android' || platform === 'ios';
const nativeBridge = isMobilePlatform ? new NativeMobileBridge() : new NativeDesktopBridge();
class Channel extends events.EventEmitter {
    constructor(channelName) {
        super();
        this.channelName = channelName;
        const self = this;
        nativeBridge.registerChannel(channelName, (args) => {
            const channelMessage = args.channelMessage;
            const payload = ChannelMessageCodec.deserialize(channelMessage);
            self.emitWrapper(payload.eventName, ...payload.args);
        });
    }
    /**
     * Sends a message to the Capacitor layer via eventName, along with arguments.
     * Arguments will be serialized with JSON.
     *
     * @param eventName The name of the event being send to.
     * @param args The Array of arguments to send.
     */
    send(eventName, ...args) {
        if (eventName === undefined || eventName === '') {
            throw new Error("Required parameter 'eventName' was not specified");
        }
        const payload = { eventName, args };
        const channelName = this.channelName;
        const channelMessage = ChannelMessageCodec.serialize(payload);
        const channelPayload = {
            channelName,
            channelMessage,
        };
        nativeBridge.emit(channelPayload);
    }
    emitWrapper(eventName, ...args) {
        const self = this;
        setImmediate(() => {
            self.emit(eventName, ...args);
        });
    }
    /**
     * Listens to `eventName` and calls `listener(args...)` when a new message arrives from the Capacitor layer.
     */
    on(eventName, listener) {
        return super.on(eventName, listener);
    }
    /**
     * Listens one time to `eventName` and calls `listener(args...)` when a new message
     * arrives from the Capacitor layer, after which it is removed.
     */
    once(eventName, listener) {
        return super.once(eventName, listener);
    }
    /**
     * Alias for `channel.on(eventName, listener)`.
     */
    addListener(eventName, listener) {
        return super.addListener(eventName, listener);
    }
    /**
     * Removes the specified `listener` from the listener array for the specified `eventName`.
     */
    removeListener(eventName, listener) {
        return super.removeListener(eventName, listener);
    }
    /**
     * Removes all listeners, or those of the specified `eventName`.
     *
     * @param eventName The name of the event all listeners will be removed from.
     */
    removeAllListeners(eventName) {
        return super.removeAllListeners(eventName);
    }
}
const appChannel = new Channel('APP_CHANNEL');
/**
 * Provides a few methods to send messages from the Node.js process to the Capacitor layer,
 * and to receive replies from the Capacitor layer.
 */
const eventChannel = new Channel('EVENT_CHANNEL');
/**
 * Emitted when the application gains focus.
 */
function onResume(listener) {
    appChannel.on('resume', listener);
}
/**
 * Emitted when the application loses focus.
 */
function onPause(listener) {
    appChannel.on('pause', listener);
}
/**
 * Returns a path for a per-user application data directory on each platform,
 * where data can be read and written.
 */
function getDataPath() {
    const path = process__default["default"].env['DATADIR'];
    if (!path) {
        throw new Error('Unable to get a directory for persistent data storage.');
    }
    return path;
}

appChannel.send('ready');

exports.channel = eventChannel;
exports.getDataPath = getDataPath;
exports.onPause = onPause;
exports.onResume = onResume;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9icmlkZ2UvYnVpbGQvYnJpZGdlL3NyYy91dGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2JyaWRnZS9idWlsZC9icmlkZ2Uvc3JjL2JyaWRnZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2JyaWRnZS9idWlsZC9icmlkZ2Uvc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBDaGFubmVsTWVzc2FnZUNvZGVjIHtcbiAgICBzdGF0aWMgc2VyaWFsaXplKHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgZXZlbnROYW1lID0gcGF5bG9hZC5ldmVudE5hbWU7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBwYXlsb2FkLmFyZ3M7XG4gICAgICAgIGNvbnN0IGV2ZW50TWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGFyZ3MpO1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgZXZlbnRNZXNzYWdlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjaGFubmVsTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgICByZXR1cm4gY2hhbm5lbE1lc3NhZ2U7XG4gICAgfVxuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZShjaGFubmVsTWVzc2FnZSkge1xuICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShjaGFubmVsTWVzc2FnZSk7XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGRhdGEuZXZlbnROYW1lO1xuICAgICAgICBjb25zdCBldmVudE1lc3NhZ2UgPSBkYXRhLmV2ZW50TWVzc2FnZTtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXTtcbiAgICAgICAgaWYgKGV2ZW50TWVzc2FnZSkge1xuICAgICAgICAgICAgYXJncyA9IEpTT04ucGFyc2UoZXZlbnRNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMuanMubWFwIiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBwcm9jZXNzIGZyb20gJ3Byb2Nlc3MnO1xuaW1wb3J0IHsgQ2hhbm5lbE1lc3NhZ2VDb2RlYyB9IGZyb20gJy4vdXRpbHMnO1xuY2xhc3MgTmF0aXZlTW9iaWxlQnJpZGdlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5tb2JpbGVCcmlkZ2UgPSBwcm9jZXNzLl9saW5rZWRCaW5kaW5nKCduYXRpdmVCcmlkZ2UnKTtcbiAgICB9XG4gICAgZW1pdChhcmdzKSB7XG4gICAgICAgIHRoaXMubW9iaWxlQnJpZGdlLmVtaXQoYXJncy5jaGFubmVsTmFtZSwgYXJncy5jaGFubmVsTWVzc2FnZSk7XG4gICAgfVxuICAgIHJlZ2lzdGVyQ2hhbm5lbChjaGFubmVsTmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5tb2JpbGVCcmlkZ2UucmVnaXN0ZXJDaGFubmVsKGNoYW5uZWxOYW1lLCAoY2hhbm5lbE5hbWUsIGNoYW5uZWxNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayh7IGNoYW5uZWxOYW1lLCBjaGFubmVsTWVzc2FnZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgTmF0aXZlRGVza3RvcEJyaWRnZSB7XG4gICAgZW1pdChhcmdzKSB7XG4gICAgICAgIGlmICghcHJvY2Vzcy5zZW5kKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIElQQyBjaGFubmVsIGhhcyBiZWVuIGVzdGFibGlzaGVkIGJldHdlZW4gdGhlIE5vZGUuanMgcHJvY2VzcyBhbmQgdGhlIENhcGFjaXRvciBsYXllci4nKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzLnNlbmQoYXJncyk7XG4gICAgfVxuICAgIHJlZ2lzdGVyQ2hhbm5lbChjaGFubmVsTmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgcHJvY2Vzcy5vbignbWVzc2FnZScsIChhcmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJncy5jaGFubmVsTmFtZSA9PT0gY2hhbm5lbE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuY29uc3QgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtO1xuY29uc3QgaXNNb2JpbGVQbGF0Zm9ybSA9IHBsYXRmb3JtID09PSAnYW5kcm9pZCcgfHwgcGxhdGZvcm0gPT09ICdpb3MnO1xuY29uc3QgbmF0aXZlQnJpZGdlID0gaXNNb2JpbGVQbGF0Zm9ybSA/IG5ldyBOYXRpdmVNb2JpbGVCcmlkZ2UoKSA6IG5ldyBOYXRpdmVEZXNrdG9wQnJpZGdlKCk7XG5jbGFzcyBDaGFubmVsIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihjaGFubmVsTmFtZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gY2hhbm5lbE5hbWU7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBuYXRpdmVCcmlkZ2UucmVnaXN0ZXJDaGFubmVsKGNoYW5uZWxOYW1lLCAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2hhbm5lbE1lc3NhZ2UgPSBhcmdzLmNoYW5uZWxNZXNzYWdlO1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IENoYW5uZWxNZXNzYWdlQ29kZWMuZGVzZXJpYWxpemUoY2hhbm5lbE1lc3NhZ2UpO1xuICAgICAgICAgICAgc2VsZi5lbWl0V3JhcHBlcihwYXlsb2FkLmV2ZW50TmFtZSwgLi4ucGF5bG9hZC5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgQ2FwYWNpdG9yIGxheWVyIHZpYSBldmVudE5hbWUsIGFsb25nIHdpdGggYXJndW1lbnRzLlxuICAgICAqIEFyZ3VtZW50cyB3aWxsIGJlIHNlcmlhbGl6ZWQgd2l0aCBKU09OLlxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgYmVpbmcgc2VuZCB0by5cbiAgICAgKiBAcGFyYW0gYXJncyBUaGUgQXJyYXkgb2YgYXJndW1lbnRzIHRvIHNlbmQuXG4gICAgICovXG4gICAgc2VuZChldmVudE5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gdW5kZWZpbmVkIHx8IGV2ZW50TmFtZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVkIHBhcmFtZXRlciAnZXZlbnROYW1lJyB3YXMgbm90IHNwZWNpZmllZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXlsb2FkID0geyBldmVudE5hbWUsIGFyZ3MgfTtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSB0aGlzLmNoYW5uZWxOYW1lO1xuICAgICAgICBjb25zdCBjaGFubmVsTWVzc2FnZSA9IENoYW5uZWxNZXNzYWdlQ29kZWMuc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBjb25zdCBjaGFubmVsUGF5bG9hZCA9IHtcbiAgICAgICAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgICAgICAgY2hhbm5lbE1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgICAgIG5hdGl2ZUJyaWRnZS5lbWl0KGNoYW5uZWxQYXlsb2FkKTtcbiAgICB9XG4gICAgZW1pdFdyYXBwZXIoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgc2VsZi5lbWl0KGV2ZW50TmFtZSwgLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0ZW5zIHRvIGBldmVudE5hbWVgIGFuZCBjYWxscyBgbGlzdGVuZXIoYXJncy4uLilgIHdoZW4gYSBuZXcgbWVzc2FnZSBhcnJpdmVzIGZyb20gdGhlIENhcGFjaXRvciBsYXllci5cbiAgICAgKi9cbiAgICBvbihldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5vbihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdGVucyBvbmUgdGltZSB0byBgZXZlbnROYW1lYCBhbmQgY2FsbHMgYGxpc3RlbmVyKGFyZ3MuLi4pYCB3aGVuIGEgbmV3IG1lc3NhZ2VcbiAgICAgKiBhcnJpdmVzIGZyb20gdGhlIENhcGFjaXRvciBsYXllciwgYWZ0ZXIgd2hpY2ggaXQgaXMgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBvbmNlKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLm9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFsaWFzIGZvciBgY2hhbm5lbC5vbihldmVudE5hbWUsIGxpc3RlbmVyKWAuXG4gICAgICovXG4gICAgYWRkTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gc3VwZXIuYWRkTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBgbGlzdGVuZXJgIGZyb20gdGhlIGxpc3RlbmVyIGFycmF5IGZvciB0aGUgc3BlY2lmaWVkIGBldmVudE5hbWVgLlxuICAgICAqL1xuICAgIHJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIG9mIHRoZSBzcGVjaWZpZWQgYGV2ZW50TmFtZWAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudCBhbGwgbGlzdGVuZXJzIHdpbGwgYmUgcmVtb3ZlZCBmcm9tLlxuICAgICAqL1xuICAgIHJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlbW92ZUFsbExpc3RlbmVycyhldmVudE5hbWUpO1xuICAgIH1cbn1cbmNvbnN0IGFwcENoYW5uZWwgPSBuZXcgQ2hhbm5lbCgnQVBQX0NIQU5ORUwnKTtcbi8qKlxuICogUHJvdmlkZXMgYSBmZXcgbWV0aG9kcyB0byBzZW5kIG1lc3NhZ2VzIGZyb20gdGhlIE5vZGUuanMgcHJvY2VzcyB0byB0aGUgQ2FwYWNpdG9yIGxheWVyLFxuICogYW5kIHRvIHJlY2VpdmUgcmVwbGllcyBmcm9tIHRoZSBDYXBhY2l0b3IgbGF5ZXIuXG4gKi9cbmNvbnN0IGV2ZW50Q2hhbm5lbCA9IG5ldyBDaGFubmVsKCdFVkVOVF9DSEFOTkVMJyk7XG4vKipcbiAqIEVtaXR0ZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gZ2FpbnMgZm9jdXMuXG4gKi9cbmZ1bmN0aW9uIG9uUmVzdW1lKGxpc3RlbmVyKSB7XG4gICAgYXBwQ2hhbm5lbC5vbigncmVzdW1lJywgbGlzdGVuZXIpO1xufVxuLyoqXG4gKiBFbWl0dGVkIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGxvc2VzIGZvY3VzLlxuICovXG5mdW5jdGlvbiBvblBhdXNlKGxpc3RlbmVyKSB7XG4gICAgYXBwQ2hhbm5lbC5vbigncGF1c2UnLCBsaXN0ZW5lcik7XG59XG4vKipcbiAqIFJldHVybnMgYSBwYXRoIGZvciBhIHBlci11c2VyIGFwcGxpY2F0aW9uIGRhdGEgZGlyZWN0b3J5IG9uIGVhY2ggcGxhdGZvcm0sXG4gKiB3aGVyZSBkYXRhIGNhbiBiZSByZWFkIGFuZCB3cml0dGVuLlxuICovXG5mdW5jdGlvbiBnZXREYXRhUGF0aCgpIHtcbiAgICBjb25zdCBwYXRoID0gcHJvY2Vzcy5lbnZbJ0RBVEFESVInXTtcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZ2V0IGEgZGlyZWN0b3J5IGZvciBwZXJzaXN0ZW50IGRhdGEgc3RvcmFnZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG59XG5leHBvcnQgeyBDaGFubmVsTWVzc2FnZUNvZGVjLCBhcHBDaGFubmVsLCBldmVudENoYW5uZWwsIG9uUmVzdW1lLCBvblBhdXNlLCBnZXREYXRhUGF0aCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnJpZGdlLmpzLm1hcCIsImltcG9ydCB7IGFwcENoYW5uZWwsIGV2ZW50Q2hhbm5lbCwgb25SZXN1bWUsIG9uUGF1c2UsIGdldERhdGFQYXRoIH0gZnJvbSAnLi9icmlkZ2UnO1xuYXBwQ2hhbm5lbC5zZW5kKCdyZWFkeScpO1xuZXhwb3J0IHsgZXZlbnRDaGFubmVsIGFzIGNoYW5uZWwsIG9uUmVzdW1lLCBvblBhdXNlLCBnZXREYXRhUGF0aCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbInByb2Nlc3MiLCJFdmVudEVtaXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQU8sTUFBTSxtQkFBbUIsQ0FBQztBQUNqQyxJQUFJLE9BQU8sU0FBUyxDQUFDLE9BQU8sRUFBRTtBQUM5QixRQUFRLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDNUMsUUFBUSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFFBQVEsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxRQUFRLE1BQU0sSUFBSSxHQUFH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
