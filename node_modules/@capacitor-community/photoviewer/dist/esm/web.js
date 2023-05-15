import { WebPlugin } from '@capacitor/core';
import { defineCustomElements as jeepPhotoviewer } from 'jeep-photoviewer/loader';
export class PhotoViewerWeb extends WebPlugin {
    constructor() {
        super(...arguments);
        this._imageList = [];
        this._options = {};
        this._mode = 'one';
        this._startFrom = 0;
        this._modeList = ['one', 'gallery', 'slider'];
    }
    async echo(options) {
        return options;
    }
    async show(options) {
        return new Promise((resolve, reject) => {
            var _a;
            jeepPhotoviewer(window);
            if (Object.keys(options).includes('images')) {
                this._imageList = options.images;
            }
            if (Object.keys(options).includes('options')) {
                this._options = (_a = options.options) !== null && _a !== void 0 ? _a : {};
            }
            if (Object.keys(options).includes('mode')) {
                const mMode = options.mode;
                if (this._modeList.includes(mMode)) {
                    this._mode = mMode !== null && mMode !== void 0 ? mMode : 'one';
                }
            }
            if (Object.keys(options).includes('startFrom')) {
                const mStartFrom = options.startFrom;
                this._startFrom = mStartFrom !== null && mStartFrom !== void 0 ? mStartFrom : 0;
            }
            const photoViewer = document.createElement('jeep-photoviewer');
            photoViewer.imageList = this._imageList;
            photoViewer.mode = this._mode;
            if (this._mode === 'one' || this._mode === 'slider') {
                photoViewer.startFrom = this._startFrom;
            }
            const optionsKeys = Object.keys(this._options);
            let divid;
            if (optionsKeys.length > 0) {
                photoViewer.options = this._options;
                if (optionsKeys.includes('divid')) {
                    divid = this._options.divid;
                }
                else {
                    divid = 'photoviewer-container';
                }
            }
            else {
                divid = 'photoviewer-container';
            }
            this._container = document.querySelector(`#${divid}`);
            // check if already a photoviewer element
            if (this._container != null) {
                const isPVEl = this._container.querySelector('jeep-photoviewer');
                if (isPVEl != null) {
                    this._container.removeChild(isPVEl);
                }
                photoViewer.addEventListener('jeepPhotoViewerResult', async (ev) => {
                    const res = ev.detail;
                    if (res === null) {
                        reject('Error: event does not include detail ');
                    }
                    else {
                        this.notifyListeners('jeepCapPhotoViewerExit', res);
                        this._container.removeChild(photoViewer);
                        resolve(res);
                    }
                }, false);
                this._container.appendChild(photoViewer);
            }
            else {
                reject("Div id='photoviewer-container' not found");
            }
        });
    }
}
//# sourceMappingURL=web.js.map