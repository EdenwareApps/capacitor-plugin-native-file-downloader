import { registerPlugin } from '@capacitor/core';
const CapacitorNodeJS = registerPlugin('CapacitorNodeJS', {
    web: () => import('./web').then((m) => new m.CapacitorNodeJSWeb()),
    electron: () => window.CapacitorCustomPlatform.plugins.CapacitorNodeJS,
});
export { CapacitorNodeJS };
//# sourceMappingURL=implementation.js.map