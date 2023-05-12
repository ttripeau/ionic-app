import { Component, OnInit, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import { PhotoViewer, Image, ViewerOptions, capShowOptions, capShowResult } from '@capacitor-community/photoviewer';
import { Capacitor } from '@capacitor/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-photoviewer',
  templateUrl: './photoviewer.component.html',
  styleUrls: ['./photoviewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PhotoviewerModal implements OnInit, AfterViewInit {
  @Input() url?: string;
  @Input() text?: string;

  platform: string;
  imageList: Image[];
  mode: string = 'one';
  startFrom: number = 0;
  options: ViewerOptions = {} as ViewerOptions;

  constructor(private modalController: ModalController) {
    this.platform = Capacitor.getPlatform();
  }

  async ngOnInit() {
    this.imageList = [{ url: this.url ?? '', title: this.text ?? '' }];
  }
  async ngAfterViewInit() {
    const show = async (imageList: Image[], mode: string, startFrom: number, options?: ViewerOptions): Promise<capShowResult> => {
      const opt: capShowOptions = {} as capShowOptions;
      opt.images = imageList;
      opt.mode = mode;
      if (mode === 'one' || mode === 'slider') {
        opt.startFrom = startFrom;
      }
      if (options) {
        opt.options = options;
      }
      try {
        const ret = await PhotoViewer.show(opt);
        if (ret.result) {
          return Promise.resolve(ret);
        } else {
          return Promise.reject(ret.message);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    };

    await PhotoViewer.echo({ value: 'Hello from PhotoViewer' });

    try {
      this.mode = 'one';
      this.startFrom = 0;
      // **************************************
      // here you defined the different options
      // **************************************
      // uncomment the following desired lines below
      // this.options.title = false;
      this.options.share = false;
      // options.transformer = "depth";
      // options.spancount = 2
      this.options.maxzoomscale = 3;
      this.options.compressionquality = 0.6;
      this.options.movieoptions = { mode: 'portrait', imagetime: 3 };
      // **************************************
      // here you defined url or Base64 images
      // **************************************
      // comment or uncomment as you wish
      // http images call
      const result = await show(this.imageList, this.mode, this.startFrom, this.options);
      this.modalController.dismiss(undefined);
      console.log(`after show ret: ${JSON.stringify(result)}`);
      // base64 images call
      //ret = await show(base64List, options);
    } catch (err) {
      console.log(`in catch before toast err: ${err}`);
      if (this.platform === 'web' || this.platform === 'electron') {
        window.location.reload();
      }
    }
  }
}
