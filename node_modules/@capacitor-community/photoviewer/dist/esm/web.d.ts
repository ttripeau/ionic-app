import { WebPlugin } from '@capacitor/core';
import type { PhotoViewerPlugin, capEchoOptions, capEchoResult, capShowOptions, capShowResult } from './definitions';
export declare class PhotoViewerWeb extends WebPlugin implements PhotoViewerPlugin {
    private _imageList;
    private _options;
    private _mode;
    private _startFrom;
    private _container;
    private _modeList;
    echo(options: capEchoOptions): Promise<capEchoResult>;
    show(options: capShowOptions): Promise<capShowResult>;
}
