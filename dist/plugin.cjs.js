'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const CapacitorNodeJS = core.registerPlugin('CapacitorNodeJS', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.CapacitorNodeJSWeb()),
    electron: () => window.CapacitorCustomPlatform.plugins.CapacitorNodeJS,
});

class NodeJSPlugin {
    constructor() {
        this.listenerList = [];
    }
    start(args) {
        return CapacitorNodeJS.start(args);
    }
    send(args) {
        return CapacitorNodeJS.send(args);
    }
    whenReady() {
        return CapacitorNodeJS.whenReady();
    }
    addListener(eventName, listenerFunc) {
        const listenerHandle = CapacitorNodeJS.addListener(eventName, (data) => {
            listenerFunc(data);
        });
        this.listenerList.push({ eventName, listenerHandle });
        return listenerHandle;
    }
    async removeListener(listenerHandle) {
        if (core.Capacitor.getPlatform() === 'electron') {
            await CapacitorNodeJS.removeListener(listenerHandle);
        }
        else {
            await listenerHandle.remove();
        }
        for (let index = 0; index < this.listenerList.length; index++) {
            const listener = this.listenerList[index];
            if (listenerHandle === (await listener.listenerHandle)) {
                this.listenerList.splice(index, 1);
                break;
            }
        }
    }
    async removeAllListeners(eventName) {
        for (const listener of [...this.listenerList]) {
            if (!eventName || eventName === listener.eventName) {
                const listenerHandle = await listener.listenerHandle;
                await this.removeListener(listenerHandle);
            }
        }
    }
}
const NodeJS = new NodeJSPlugin();

class CapacitorNodeJSWeb extends core.WebPlugin {
    unavailableNodeJS() {
        return this.unavailable('The NodeJS engine is not available in the browser!');
    }
    start() {
        throw this.unavailableNodeJS();
    }
    send() {
        throw this.unavailableNodeJS();
    }
    whenReady() {
        throw this.unavailableNodeJS();
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CapacitorNodeJSWeb: CapacitorNodeJSWeb
});

exports.NodeJS = NodeJS;
//# sourceMappingURL=plugin.cjs.js.map
