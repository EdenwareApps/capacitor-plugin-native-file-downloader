'use strict';

var require$$1 = require('electron');
var require$$1$1 = require('events');
var require$$2 = require('fs');
var require$$3 = require('path');
var require$$0 = require('child_process');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$1__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$1$1);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {};

var implementation = {};

var utils$1 = {};

Object.defineProperty(utils$1, "__esModule", { value: true });
utils$1.ChannelMessageCodec = void 0;
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
utils$1.ChannelMessageCodec = ChannelMessageCodec;

var utils = {};

Object.defineProperty(utils, "__esModule", { value: true });
utils.joinEnv = void 0;
const path_1 = require$$3__default["default"];
function joinEnv(...variables) {
    let envVariable = '';
    for (let index = 0; index < variables.length; index++) {
        const variable = variables[index];
        if (!variable)
            continue;
        envVariable += variable;
        if (index < variables.length - 1) {
            envVariable += path_1.delimiter;
        }
    }
    return envVariable;
}
utils.joinEnv = joinEnv;

var hasRequiredImplementation;

function requireImplementation () {
	if (hasRequiredImplementation) return implementation;
	hasRequiredImplementation = 1;
	Object.defineProperty(implementation, "__esModule", { value: true });
	implementation.CapacitorNodeJSImplementation = void 0;
	const child_process_1 = require$$0__default["default"];
	const electron_1 = require$$1__default["default"];
	const fs_1 = require$$2__default["default"];
	const path_1 = require$$3__default["default"];
	const utils_1 = utils$1;
	const index_1 = requireSrc();
	const utils_2 = utils;
	class EngineStatus {
	    constructor() {
	        this.whenEngineReadyListeners = [];
	        this.isEngineStarted = false;
	        this.isEngineReady = false;
	    }
	    setStarted() {
	        this.isEngineStarted = true;
	    }
	    isStarted() {
	        return this.isEngineStarted;
	    }
	    setReady() {
	        this.isEngineReady = true;
	        while (this.whenEngineReadyListeners.length > 0) {
	            const whenEngineReadyListener = this.whenEngineReadyListeners[0];
	            whenEngineReadyListener();
	            this.whenEngineReadyListeners.splice(0, 1);
	        }
	    }
	    isReady() {
	        return this.isEngineReady;
	    }
	    whenReady(callback) {
	        if (this.isReady()) {
	            callback();
	        }
	        else {
	            this.whenEngineReadyListeners.push(callback);
	        }
	    }
	}
	class CapacitorNodeJSImplementation {
	    constructor(eventNotifier) {
	        this.engineStatus = new EngineStatus();
	        this.eventNotifier = eventNotifier;
	    }
	    async startEngine(projectDir, mainFile, args, env) {
	        if (this.engineStatus.isStarted()) {
	            throw new Error('The Node.js engine has already been started.');
	        }
	        this.engineStatus.setStarted();
	        const projectPath = path_1.join(electron_1.app.getAppPath(), 'app', projectDir);
	        const modulesPath = path_1.join(__dirname, '..', 'assets', 'builtin_modules');
	        const dataPath = electron_1.app.getPath('userData');
	        if (!fs_1.existsSync(projectPath)) {
	            throw new Error('Unable to access the Node.js project. (No such directory)');
	        }
	        const projectPackageJsonPath = path_1.join(projectPath, 'package.json');
	        let projectMainFile = 'index.js';
	        if (mainFile) {
	            projectMainFile = mainFile;
	        }
	        else if (fs_1.existsSync(projectPackageJsonPath)) {
	            try {
	                const projectPackageJson = await Promise.resolve().then(() => require(projectPackageJsonPath));
	                const projectPackageJsonMainFile = projectPackageJson.main;
	                if (projectPackageJsonMainFile) {
	                    projectMainFile = projectPackageJson.main;
	                }
	            }
	            catch (_a) {
	                throw new Error('Failed to read the package.json file of the Node.js project.');
	            }
	        }
	        const projectMainPath = path_1.join(projectPath, projectMainFile);
	        if (!fs_1.existsSync(projectMainPath)) {
	            throw new Error('Unable to access main script of the Node.js project. (No such file)');
	        }
	        const modulesPaths = utils_2.joinEnv(projectPath, modulesPath);
	        const nodeEnv = Object.assign({ NODE_PATH: modulesPaths, DATADIR: dataPath }, env);
	        const nodeOptions = {
	            env: nodeEnv,
	            serialization: 'json',
	        };
	        this.nodeProcess = child_process_1.fork(projectMainPath, args, nodeOptions);
	        this.nodeProcess.on('message', (args) => {
	            this.receiveMessage(args.channelName, args.channelMessage);
	        });
	        electron_1.app.on('quit', () => {
	            var _a;
	            (_a = this.nodeProcess) === null || _a === void 0 ? void 0 : _a.kill();
	        });
	    }
	    resolveWhenReady() {
	        return new Promise((resolve, reject) => {
	            if (!this.engineStatus.isStarted()) {
	                reject('The Node.js engine has not been started yet.');
	            }
	            this.engineStatus.whenReady(() => resolve());
	        });
	    }
	    sendMessage(channelName, payload) {
	        if (!this.engineStatus.isStarted()) {
	            throw new Error('The Node.js engine has not been started yet.');
	        }
	        if (!this.engineStatus.isReady()) {
	            throw new Error('The Node.js engine is not ready yet.');
	        }
	        if (this.nodeProcess === undefined || !payload.eventName || !payload.args)
	            return;
	        const channelMessage = utils_1.ChannelMessageCodec.serialize(payload);
	        const channelData = {
	            channelName,
	            channelMessage,
	        };
	        this.nodeProcess.send(channelData);
	    }
	    receiveMessage(channelName, channelMessage) {
	        const payload = utils_1.ChannelMessageCodec.deserialize(channelMessage);
	        const eventName = payload.eventName;
	        const args = payload.args;
	        if (channelName === index_1.CapacitorNodeJS.CHANNEL_NAME_APP && eventName === 'ready') {
	            this.engineStatus.setReady();
	        }
	        else if (channelName === index_1.CapacitorNodeJS.CHANNEL_NAME_EVENT) {
	            this.eventNotifier.channelReceive(eventName, args);
	        }
	    }
	}
	implementation.CapacitorNodeJSImplementation = CapacitorNodeJSImplementation;
	
	return implementation;
}

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;
	Object.defineProperty(src, "__esModule", { value: true });
	src.CapacitorNodeJS = void 0;
	const electron_1 = require$$1__default["default"];
	const events_1 = require$$1__default$1["default"];
	const fs_1 = require$$2__default["default"];
	const path_1 = require$$3__default["default"];
	const implementation_1 = requireImplementation();
	class PluginSettings {
	    constructor() {
	        this.nodeDir = 'nodejs';
	        this.startMode = 'auto';
	    }
	}
	class CapacitorNodeJS extends events_1.EventEmitter {
	    constructor( /*config?: Record<string, any>*/) {
	        super();
	        // removeAllListeners() function is missing (https://github.com/capacitor-community/electron/pull/185)
	        //---------------------------------------------------------------------------------------
	        //#endregion
	        //#region PluginEvents
	        //---------------------------------------------------------------------------------------
	        this.PluginEventNotifier = {
	            // Bridge -------------------------------------------------------------------------------
	            channelReceive: (eventName, payloadArray) => {
	                this.notifyChannelListeners(eventName, payloadArray);
	            },
	        };
	        const browserWindow = electron_1.BrowserWindow.getAllWindows()[0];
	        //this.config = config;
	        this.implementation = new implementation_1.CapacitorNodeJSImplementation(this.PluginEventNotifier);
	        browserWindow.on('focus', () => {
	            this.implementation.sendMessage(CapacitorNodeJS.CHANNEL_NAME_APP, {
	                eventName: 'resume',
	                args: [],
	            });
	        });
	        browserWindow.on('blur', () => {
	            this.implementation.sendMessage(CapacitorNodeJS.CHANNEL_NAME_APP, {
	                eventName: 'pause',
	                args: [],
	            });
	        });
	        this.readPluginSettings().then((pluginSettings) => {
	            if (pluginSettings.startMode === 'auto') {
	                this.implementation.startEngine(pluginSettings.nodeDir);
	            }
	        });
	    }
	    async readPluginSettings() {
	        var _a;
	        //!-------------------------- workaround ---------------------------
	        // the configuration exposed by the capacitor-community/electron platform
	        // is always empty for some reason
	        const configPathBase = path_1.join(electron_1.app.getAppPath(), 'capacitor.config.');
	        const configPathExt = fs_1.existsSync(configPathBase + 'json')
	            ? 'json'
	            : fs_1.existsSync(configPathBase + 'js')
	                ? 'js'
	                : fs_1.existsSync(configPathBase + 'ts')
	                    ? 'ts'
	                    : undefined;
	        const configPath = configPathBase + configPathExt;
	        const configFile = await require(configPath);
	        const capacitorConfig = configFile.default || configFile;
	        const config = (_a = capacitorConfig === null || capacitorConfig === void 0 ? void 0 : capacitorConfig.plugins) === null || _a === void 0 ? void 0 : _a.CapacitorNodeJS;
	        //!-----------------------------------------------------------------
	        const settings = new PluginSettings();
	        settings.nodeDir = (config === null || config === void 0 ? void 0 : config.nodeDir) || settings.nodeDir;
	        settings.startMode = (config === null || config === void 0 ? void 0 : config.startMode) || settings.startMode;
	        return settings;
	    }
	    //#region PluginMethods
	    //---------------------------------------------------------------------------------------
	    async start(args) {
	        var _a;
	        const pluginSettings = await this.readPluginSettings();
	        if (pluginSettings.startMode !== 'manual') {
	            throw new Error('Manual startup of the Node.js engine is not enabled.');
	        }
	        const projectDir = (_a = args === null || args === void 0 ? void 0 : args.nodeDir) !== null && _a !== void 0 ? _a : pluginSettings.nodeDir;
	        const nodeMain = args === null || args === void 0 ? void 0 : args.script;
	        const nodeArgs = args === null || args === void 0 ? void 0 : args.args;
	        const nodeEnv = args === null || args === void 0 ? void 0 : args.env;
	        this.implementation.startEngine(projectDir, nodeMain, nodeArgs, nodeEnv);
	    }
	    async send(args) {
	        const eventName = args.eventName;
	        if (eventName === undefined || eventName === '') {
	            throw new Error("Required parameter 'eventName' was not specified");
	        }
	        if (args.args === undefined) {
	            args.args = [];
	        }
	        this.implementation.sendMessage(CapacitorNodeJS.CHANNEL_NAME_EVENT, args);
	    }
	    async whenReady() {
	        return this.implementation.resolveWhenReady();
	    }
	    //---------------------------------------------------------------------------------------
	    //#endregion
	    //#region PluginListeners
	    //---------------------------------------------------------------------------------------
	    notifyChannelListeners(eventName, payloadArray) {
	        const args = { args: payloadArray };
	        this.emit(eventName, args);
	    }
	}
	src.CapacitorNodeJS = CapacitorNodeJS;
	CapacitorNodeJS.CHANNEL_NAME_APP = 'APP_CHANNEL';
	CapacitorNodeJS.CHANNEL_NAME_EVENT = 'EVENT_CHANNEL';
	
	return src;
}

var srcExports = requireSrc();
var index = /*@__PURE__*/getDefaultExportFromCjs(srcExports);

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlcyI6WyIuLi9idWlsZC9icmlkZ2Uvc3JjL3V0aWxzLmpzIiwiLi4vYnVpbGQvZWxlY3Ryb24vc3JjL3V0aWxzLmpzIiwiLi4vYnVpbGQvZWxlY3Ryb24vc3JjL2ltcGxlbWVudGF0aW9uLmpzIiwiLi4vYnVpbGQvZWxlY3Ryb24vc3JjL2luZGV4LmpzIiwiLi4vYnVpbGQvZWxlY3Ryb24vc3JjL2luZGV4LmpzP2NvbW1vbmpzLWVudHJ5Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DaGFubmVsTWVzc2FnZUNvZGVjID0gdm9pZCAwO1xuY2xhc3MgQ2hhbm5lbE1lc3NhZ2VDb2RlYyB7XG4gICAgc3RhdGljIHNlcmlhbGl6ZShwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IHBheWxvYWQuZXZlbnROYW1lO1xuICAgICAgICBjb25zdCBhcmdzID0gcGF5bG9hZC5hcmdzO1xuICAgICAgICBjb25zdCBldmVudE1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShhcmdzKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgICAgIGV2ZW50TWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2hhbm5lbE1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgcmV0dXJuIGNoYW5uZWxNZXNzYWdlO1xuICAgIH1cbiAgICBzdGF0aWMgZGVzZXJpYWxpemUoY2hhbm5lbE1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoY2hhbm5lbE1lc3NhZ2UpO1xuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBkYXRhLmV2ZW50TmFtZTtcbiAgICAgICAgY29uc3QgZXZlbnRNZXNzYWdlID0gZGF0YS5ldmVudE1lc3NhZ2U7XG4gICAgICAgIGxldCBhcmdzID0gW107XG4gICAgICAgIGlmIChldmVudE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGFyZ3MgPSBKU09OLnBhcnNlKGV2ZW50TWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hhbm5lbE1lc3NhZ2VDb2RlYyA9IENoYW5uZWxNZXNzYWdlQ29kZWM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuam9pbkVudiA9IHZvaWQgMDtcbmNvbnN0IHBhdGhfMSA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuZnVuY3Rpb24gam9pbkVudiguLi52YXJpYWJsZXMpIHtcbiAgICBsZXQgZW52VmFyaWFibGUgPSAnJztcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdmFyaWFibGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB2YXJpYWJsZSA9IHZhcmlhYmxlc1tpbmRleF07XG4gICAgICAgIGlmICghdmFyaWFibGUpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgZW52VmFyaWFibGUgKz0gdmFyaWFibGU7XG4gICAgICAgIGlmIChpbmRleCA8IHZhcmlhYmxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBlbnZWYXJpYWJsZSArPSBwYXRoXzEuZGVsaW1pdGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbnZWYXJpYWJsZTtcbn1cbmV4cG9ydHMuam9pbkVudiA9IGpvaW5FbnY7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FwYWNpdG9yTm9kZUpTSW1wbGVtZW50YXRpb24gPSB2b2lkIDA7XG5jb25zdCBjaGlsZF9wcm9jZXNzXzEgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcbmNvbnN0IGVsZWN0cm9uXzEgPSByZXF1aXJlKFwiZWxlY3Ryb25cIik7XG5jb25zdCBmc18xID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4uLy4uL2JyaWRnZS9zcmMvdXRpbHNcIik7XG5jb25zdCBpbmRleF8xID0gcmVxdWlyZShcIi4vaW5kZXhcIik7XG5jb25zdCB1dGlsc18yID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jbGFzcyBFbmdpbmVTdGF0dXMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLndoZW5FbmdpbmVSZWFkeUxpc3RlbmVycyA9IFtdO1xuICAgICAgICB0aGlzLmlzRW5naW5lU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRW5naW5lUmVhZHkgPSBmYWxzZTtcbiAgICB9XG4gICAgc2V0U3RhcnRlZCgpIHtcbiAgICAgICAgdGhpcy5pc0VuZ2luZVN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpc1N0YXJ0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRW5naW5lU3RhcnRlZDtcbiAgICB9XG4gICAgc2V0UmVhZHkoKSB7XG4gICAgICAgIHRoaXMuaXNFbmdpbmVSZWFkeSA9IHRydWU7XG4gICAgICAgIHdoaWxlICh0aGlzLndoZW5FbmdpbmVSZWFkeUxpc3RlbmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB3aGVuRW5naW5lUmVhZHlMaXN0ZW5lciA9IHRoaXMud2hlbkVuZ2luZVJlYWR5TGlzdGVuZXJzWzBdO1xuICAgICAgICAgICAgd2hlbkVuZ2luZVJlYWR5TGlzdGVuZXIoKTtcbiAgICAgICAgICAgIHRoaXMud2hlbkVuZ2luZVJlYWR5TGlzdGVuZXJzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc1JlYWR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VuZ2luZVJlYWR5O1xuICAgIH1cbiAgICB3aGVuUmVhZHkoY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53aGVuRW5naW5lUmVhZHlMaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBDYXBhY2l0b3JOb2RlSlNJbXBsZW1lbnRhdGlvbiB7XG4gICAgY29uc3RydWN0b3IoZXZlbnROb3RpZmllcikge1xuICAgICAgICB0aGlzLmVuZ2luZVN0YXR1cyA9IG5ldyBFbmdpbmVTdGF0dXMoKTtcbiAgICAgICAgdGhpcy5ldmVudE5vdGlmaWVyID0gZXZlbnROb3RpZmllcjtcbiAgICB9XG4gICAgYXN5bmMgc3RhcnRFbmdpbmUocHJvamVjdERpciwgbWFpbkZpbGUsIGFyZ3MsIGVudikge1xuICAgICAgICBpZiAodGhpcy5lbmdpbmVTdGF0dXMuaXNTdGFydGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIE5vZGUuanMgZW5naW5lIGhhcyBhbHJlYWR5IGJlZW4gc3RhcnRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVuZ2luZVN0YXR1cy5zZXRTdGFydGVkKCk7XG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gcGF0aF8xLmpvaW4oZWxlY3Ryb25fMS5hcHAuZ2V0QXBwUGF0aCgpLCAnYXBwJywgcHJvamVjdERpcik7XG4gICAgICAgIGNvbnN0IG1vZHVsZXNQYXRoID0gcGF0aF8xLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnYXNzZXRzJywgJ2J1aWx0aW5fbW9kdWxlcycpO1xuICAgICAgICBjb25zdCBkYXRhUGF0aCA9IGVsZWN0cm9uXzEuYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyk7XG4gICAgICAgIGlmICghZnNfMS5leGlzdHNTeW5jKHByb2plY3RQYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gYWNjZXNzIHRoZSBOb2RlLmpzIHByb2plY3QuIChObyBzdWNoIGRpcmVjdG9yeSknKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9qZWN0UGFja2FnZUpzb25QYXRoID0gcGF0aF8xLmpvaW4ocHJvamVjdFBhdGgsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgICAgbGV0IHByb2plY3RNYWluRmlsZSA9ICdpbmRleC5qcyc7XG4gICAgICAgIGlmIChtYWluRmlsZSkge1xuICAgICAgICAgICAgcHJvamVjdE1haW5GaWxlID0gbWFpbkZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZnNfMS5leGlzdHNTeW5jKHByb2plY3RQYWNrYWdlSnNvblBhdGgpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2plY3RQYWNrYWdlSnNvbiA9IGF3YWl0IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gcmVxdWlyZShwcm9qZWN0UGFja2FnZUpzb25QYXRoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvamVjdFBhY2thZ2VKc29uTWFpbkZpbGUgPSBwcm9qZWN0UGFja2FnZUpzb24ubWFpbjtcbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdFBhY2thZ2VKc29uTWFpbkZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdE1haW5GaWxlID0gcHJvamVjdFBhY2thZ2VKc29uLm1haW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVhZCB0aGUgcGFja2FnZS5qc29uIGZpbGUgb2YgdGhlIE5vZGUuanMgcHJvamVjdC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9qZWN0TWFpblBhdGggPSBwYXRoXzEuam9pbihwcm9qZWN0UGF0aCwgcHJvamVjdE1haW5GaWxlKTtcbiAgICAgICAgaWYgKCFmc18xLmV4aXN0c1N5bmMocHJvamVjdE1haW5QYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gYWNjZXNzIG1haW4gc2NyaXB0IG9mIHRoZSBOb2RlLmpzIHByb2plY3QuIChObyBzdWNoIGZpbGUpJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW9kdWxlc1BhdGhzID0gdXRpbHNfMi5qb2luRW52KHByb2plY3RQYXRoLCBtb2R1bGVzUGF0aCk7XG4gICAgICAgIGNvbnN0IG5vZGVFbnYgPSBPYmplY3QuYXNzaWduKHsgTk9ERV9QQVRIOiBtb2R1bGVzUGF0aHMsIERBVEFESVI6IGRhdGFQYXRoIH0sIGVudik7XG4gICAgICAgIGNvbnN0IG5vZGVPcHRpb25zID0ge1xuICAgICAgICAgICAgZW52OiBub2RlRW52LFxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbjogJ2pzb24nLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm5vZGVQcm9jZXNzID0gY2hpbGRfcHJvY2Vzc18xLmZvcmsocHJvamVjdE1haW5QYXRoLCBhcmdzLCBub2RlT3B0aW9ucyk7XG4gICAgICAgIHRoaXMubm9kZVByb2Nlc3Mub24oJ21lc3NhZ2UnLCAoYXJncykgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWNlaXZlTWVzc2FnZShhcmdzLmNoYW5uZWxOYW1lLCBhcmdzLmNoYW5uZWxNZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVsZWN0cm9uXzEuYXBwLm9uKCdxdWl0JywgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgKF9hID0gdGhpcy5ub2RlUHJvY2VzcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmtpbGwoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlc29sdmVXaGVuUmVhZHkoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZW5naW5lU3RhdHVzLmlzU3RhcnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCdUaGUgTm9kZS5qcyBlbmdpbmUgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgeWV0LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbmdpbmVTdGF0dXMud2hlblJlYWR5KCgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzZW5kTWVzc2FnZShjaGFubmVsTmFtZSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoIXRoaXMuZW5naW5lU3RhdHVzLmlzU3RhcnRlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBOb2RlLmpzIGVuZ2luZSBoYXMgbm90IGJlZW4gc3RhcnRlZCB5ZXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmVuZ2luZVN0YXR1cy5pc1JlYWR5KCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIE5vZGUuanMgZW5naW5lIGlzIG5vdCByZWFkeSB5ZXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZVByb2Nlc3MgPT09IHVuZGVmaW5lZCB8fCAhcGF5bG9hZC5ldmVudE5hbWUgfHwgIXBheWxvYWQuYXJncylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgY2hhbm5lbE1lc3NhZ2UgPSB1dGlsc18xLkNoYW5uZWxNZXNzYWdlQ29kZWMuc2VyaWFsaXplKHBheWxvYWQpO1xuICAgICAgICBjb25zdCBjaGFubmVsRGF0YSA9IHtcbiAgICAgICAgICAgIGNoYW5uZWxOYW1lLFxuICAgICAgICAgICAgY2hhbm5lbE1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubm9kZVByb2Nlc3Muc2VuZChjaGFubmVsRGF0YSk7XG4gICAgfVxuICAgIHJlY2VpdmVNZXNzYWdlKGNoYW5uZWxOYW1lLCBjaGFubmVsTWVzc2FnZSkge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gdXRpbHNfMS5DaGFubmVsTWVzc2FnZUNvZGVjLmRlc2VyaWFsaXplKGNoYW5uZWxNZXNzYWdlKTtcbiAgICAgICAgY29uc3QgZXZlbnROYW1lID0gcGF5bG9hZC5ldmVudE5hbWU7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBwYXlsb2FkLmFyZ3M7XG4gICAgICAgIGlmIChjaGFubmVsTmFtZSA9PT0gaW5kZXhfMS5DYXBhY2l0b3JOb2RlSlMuQ0hBTk5FTF9OQU1FX0FQUCAmJiBldmVudE5hbWUgPT09ICdyZWFkeScpIHtcbiAgICAgICAgICAgIHRoaXMuZW5naW5lU3RhdHVzLnNldFJlYWR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hhbm5lbE5hbWUgPT09IGluZGV4XzEuQ2FwYWNpdG9yTm9kZUpTLkNIQU5ORUxfTkFNRV9FVkVOVCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE5vdGlmaWVyLmNoYW5uZWxSZWNlaXZlKGV2ZW50TmFtZSwgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLkNhcGFjaXRvck5vZGVKU0ltcGxlbWVudGF0aW9uID0gQ2FwYWNpdG9yTm9kZUpTSW1wbGVtZW50YXRpb247XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbXBsZW1lbnRhdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FwYWNpdG9yTm9kZUpTID0gdm9pZCAwO1xuY29uc3QgZWxlY3Ryb25fMSA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTtcbmNvbnN0IGV2ZW50c18xID0gcmVxdWlyZShcImV2ZW50c1wiKTtcbmNvbnN0IGZzXzEgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBwYXRoXzEgPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IGltcGxlbWVudGF0aW9uXzEgPSByZXF1aXJlKFwiLi9pbXBsZW1lbnRhdGlvblwiKTtcbmNsYXNzIFBsdWdpblNldHRpbmdzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ub2RlRGlyID0gJ25vZGVqcyc7XG4gICAgICAgIHRoaXMuc3RhcnRNb2RlID0gJ2F1dG8nO1xuICAgIH1cbn1cbmNsYXNzIENhcGFjaXRvck5vZGVKUyBleHRlbmRzIGV2ZW50c18xLkV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoIC8qY29uZmlnPzogUmVjb3JkPHN0cmluZywgYW55PiovKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIC8vIHJlbW92ZUFsbExpc3RlbmVycygpIGZ1bmN0aW9uIGlzIG1pc3NpbmcgKGh0dHBzOi8vZ2l0aHViLmNvbS9jYXBhY2l0b3ItY29tbXVuaXR5L2VsZWN0cm9uL3B1bGwvMTg1KVxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyNlbmRyZWdpb25cbiAgICAgICAgLy8jcmVnaW9uIFBsdWdpbkV2ZW50c1xuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICB0aGlzLlBsdWdpbkV2ZW50Tm90aWZpZXIgPSB7XG4gICAgICAgICAgICAvLyBCcmlkZ2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgY2hhbm5lbFJlY2VpdmU6IChldmVudE5hbWUsIHBheWxvYWRBcnJheSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbm5lbExpc3RlbmVycyhldmVudE5hbWUsIHBheWxvYWRBcnJheSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBicm93c2VyV2luZG93ID0gZWxlY3Ryb25fMS5Ccm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKVswXTtcbiAgICAgICAgLy90aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5pbXBsZW1lbnRhdGlvbiA9IG5ldyBpbXBsZW1lbnRhdGlvbl8xLkNhcGFjaXRvck5vZGVKU0ltcGxlbWVudGF0aW9uKHRoaXMuUGx1Z2luRXZlbnROb3RpZmllcik7XG4gICAgICAgIGJyb3dzZXJXaW5kb3cub24oJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbXBsZW1lbnRhdGlvbi5zZW5kTWVzc2FnZShDYXBhY2l0b3JOb2RlSlMuQ0hBTk5FTF9OQU1FX0FQUCwge1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3Jlc3VtZScsXG4gICAgICAgICAgICAgICAgYXJnczogW10sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyb3dzZXJXaW5kb3cub24oJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltcGxlbWVudGF0aW9uLnNlbmRNZXNzYWdlKENhcGFjaXRvck5vZGVKUy5DSEFOTkVMX05BTUVfQVBQLCB7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGF1c2UnLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlYWRQbHVnaW5TZXR0aW5ncygpLnRoZW4oKHBsdWdpblNldHRpbmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAocGx1Z2luU2V0dGluZ3Muc3RhcnRNb2RlID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltcGxlbWVudGF0aW9uLnN0YXJ0RW5naW5lKHBsdWdpblNldHRpbmdzLm5vZGVEaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcmVhZFBsdWdpblNldHRpbmdzKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIC8vIS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHdvcmthcm91bmQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIHRoZSBjb25maWd1cmF0aW9uIGV4cG9zZWQgYnkgdGhlIGNhcGFjaXRvci1jb21tdW5pdHkvZWxlY3Ryb24gcGxhdGZvcm1cbiAgICAgICAgLy8gaXMgYWx3YXlzIGVtcHR5IGZvciBzb21lIHJlYXNvblxuICAgICAgICBjb25zdCBjb25maWdQYXRoQmFzZSA9IHBhdGhfMS5qb2luKGVsZWN0cm9uXzEuYXBwLmdldEFwcFBhdGgoKSwgJ2NhcGFjaXRvci5jb25maWcuJyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ1BhdGhFeHQgPSBmc18xLmV4aXN0c1N5bmMoY29uZmlnUGF0aEJhc2UgKyAnanNvbicpXG4gICAgICAgICAgICA/ICdqc29uJ1xuICAgICAgICAgICAgOiBmc18xLmV4aXN0c1N5bmMoY29uZmlnUGF0aEJhc2UgKyAnanMnKVxuICAgICAgICAgICAgICAgID8gJ2pzJ1xuICAgICAgICAgICAgICAgIDogZnNfMS5leGlzdHNTeW5jKGNvbmZpZ1BhdGhCYXNlICsgJ3RzJylcbiAgICAgICAgICAgICAgICAgICAgPyAndHMnXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBjb25maWdQYXRoID0gY29uZmlnUGF0aEJhc2UgKyBjb25maWdQYXRoRXh0O1xuICAgICAgICBjb25zdCBjb25maWdGaWxlID0gYXdhaXQgcmVxdWlyZShjb25maWdQYXRoKTtcbiAgICAgICAgY29uc3QgY2FwYWNpdG9yQ29uZmlnID0gY29uZmlnRmlsZS5kZWZhdWx0IHx8IGNvbmZpZ0ZpbGU7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IChfYSA9IGNhcGFjaXRvckNvbmZpZyA9PT0gbnVsbCB8fCBjYXBhY2l0b3JDb25maWcgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhcGFjaXRvckNvbmZpZy5wbHVnaW5zKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuQ2FwYWNpdG9yTm9kZUpTO1xuICAgICAgICAvLyEtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IG5ldyBQbHVnaW5TZXR0aW5ncygpO1xuICAgICAgICBzZXR0aW5ncy5ub2RlRGlyID0gKGNvbmZpZyA9PT0gbnVsbCB8fCBjb25maWcgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNvbmZpZy5ub2RlRGlyKSB8fCBzZXR0aW5ncy5ub2RlRGlyO1xuICAgICAgICBzZXR0aW5ncy5zdGFydE1vZGUgPSAoY29uZmlnID09PSBudWxsIHx8IGNvbmZpZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogY29uZmlnLnN0YXJ0TW9kZSkgfHwgc2V0dGluZ3Muc3RhcnRNb2RlO1xuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfVxuICAgIC8vI3JlZ2lvbiBQbHVnaW5NZXRob2RzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBhc3luYyBzdGFydChhcmdzKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgcGx1Z2luU2V0dGluZ3MgPSBhd2FpdCB0aGlzLnJlYWRQbHVnaW5TZXR0aW5ncygpO1xuICAgICAgICBpZiAocGx1Z2luU2V0dGluZ3Muc3RhcnRNb2RlICE9PSAnbWFudWFsJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYW51YWwgc3RhcnR1cCBvZiB0aGUgTm9kZS5qcyBlbmdpbmUgaXMgbm90IGVuYWJsZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvamVjdERpciA9IChfYSA9IGFyZ3MgPT09IG51bGwgfHwgYXJncyA9PT0gdm9pZCAwID8gdm9pZCAwIDogYXJncy5ub2RlRGlyKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBwbHVnaW5TZXR0aW5ncy5ub2RlRGlyO1xuICAgICAgICBjb25zdCBub2RlTWFpbiA9IGFyZ3MgPT09IG51bGwgfHwgYXJncyA9PT0gdm9pZCAwID8gdm9pZCAwIDogYXJncy5zY3JpcHQ7XG4gICAgICAgIGNvbnN0IG5vZGVBcmdzID0gYXJncyA9PT0gbnVsbCB8fCBhcmdzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBhcmdzLmFyZ3M7XG4gICAgICAgIGNvbnN0IG5vZGVFbnYgPSBhcmdzID09PSBudWxsIHx8IGFyZ3MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGFyZ3MuZW52O1xuICAgICAgICB0aGlzLmltcGxlbWVudGF0aW9uLnN0YXJ0RW5naW5lKHByb2plY3REaXIsIG5vZGVNYWluLCBub2RlQXJncywgbm9kZUVudik7XG4gICAgfVxuICAgIGFzeW5jIHNlbmQoYXJncykge1xuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBhcmdzLmV2ZW50TmFtZTtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gdW5kZWZpbmVkIHx8IGV2ZW50TmFtZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVkIHBhcmFtZXRlciAnZXZlbnROYW1lJyB3YXMgbm90IHNwZWNpZmllZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJncy5hcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGFyZ3MuYXJncyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1wbGVtZW50YXRpb24uc2VuZE1lc3NhZ2UoQ2FwYWNpdG9yTm9kZUpTLkNIQU5ORUxfTkFNRV9FVkVOVCwgYXJncyk7XG4gICAgfVxuICAgIGFzeW5jIHdoZW5SZWFkeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1wbGVtZW50YXRpb24ucmVzb2x2ZVdoZW5SZWFkeSgpO1xuICAgIH1cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vI2VuZHJlZ2lvblxuICAgIC8vI3JlZ2lvbiBQbHVnaW5MaXN0ZW5lcnNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG5vdGlmeUNoYW5uZWxMaXN0ZW5lcnMoZXZlbnROYW1lLCBwYXlsb2FkQXJyYXkpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHsgYXJnczogcGF5bG9hZEFycmF5IH07XG4gICAgICAgIHRoaXMuZW1pdChldmVudE5hbWUsIGFyZ3MpO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2FwYWNpdG9yTm9kZUpTID0gQ2FwYWNpdG9yTm9kZUpTO1xuQ2FwYWNpdG9yTm9kZUpTLkNIQU5ORUxfTkFNRV9BUFAgPSAnQVBQX0NIQU5ORUwnO1xuQ2FwYWNpdG9yTm9kZUpTLkNIQU5ORUxfTkFNRV9FVkVOVCA9ICdFVkVOVF9DSEFOTkVMJztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IGdldERlZmF1bHRFeHBvcnRGcm9tQ2pzIH0gZnJvbSBcIlx1MDAwMGNvbW1vbmpzSGVscGVycy5qc1wiO1xuaW1wb3J0IHsgX19yZXF1aXJlIGFzIHJlcXVpcmVTcmMgfSBmcm9tIFwiL2hvbWUvY29kZS9wcm9qZWN0cy9oYW1wb2Vsei9DYXBhY2l0b3ItTm9kZUpTL2VsZWN0cm9uL2J1aWxkL2VsZWN0cm9uL3NyYy9pbmRleC5qc1wiO1xudmFyIHNyY0V4cG9ydHMgPSByZXF1aXJlU3JjKCk7XG5leHBvcnQgeyBzcmNFeHBvcnRzIGFzIF9fbW9kdWxlRXhwb3J0cyB9O2V4cG9ydCBkZWZhdWx0IC8qQF9fUFVSRV9fKi9nZXREZWZhdWx0RXhwb3J0RnJvbUNqcyhzcmNFeHBvcnRzKTsiXSwibmFtZXMiOlsidXRpbHMiLCJyZXF1aXJlJCQwIiwicmVxdWlyZSQkMSIsInJlcXVpcmUkJDIiLCJyZXF1aXJlJCQzIiwicmVxdWlyZSQkNCIsInJlcXVpcmUkJDUiLCJyZXF1aXJlJCQ2Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE1BQU0sQ0FBQyxjQUFjLENBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNuQ0EsT0FBQSxDQUFBLG1CQUFBLEdBQUcsS0FBSyxFQUFFO0FBQ3JDLE1BQU0sbUJBQW1CLENBQUM7QUFDMUIsSUFBSSxPQUFPLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDOUIsUUFBUSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzVDLFFBQVEsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNsQyxRQUFRLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsUUFBUSxNQUFNLElBQUksR0FBRztBQUNyQixZQUFZLFNBQVM7QUFDckIsWUFBWSxZQUFZO0FBQ3hCLFNBQVMsQ0FB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
