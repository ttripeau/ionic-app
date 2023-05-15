import { registerPlugin } from '@capacitor/core';
const PhotoViewer = registerPlugin('PhotoViewer', {
    web: () => import('./web').then(m => new m.PhotoViewerWeb()),
});
export * from './definitions';
export { PhotoViewer };
//# sourceMappingURL=index.js.map