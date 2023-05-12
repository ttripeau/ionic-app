import { Component, Input } from '@angular/core';
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-qrcode-modal',
  templateUrl: './qrcode-modal.html',
  styleUrls: ['./qrcode-modal.scss'],
})
export class QrcodeModal {
  @Input() qrcode: string = '';

  private brightnessOrigin: number;

  constructor(private modalController: ModalController) {
    this.initialyze();
  }

  public async closeModal(): Promise<void> {
    try {
      await ScreenBrightness.setBrightness({ brightness: this.brightnessOrigin });
    } catch (error) {
      console.log(error);
    }
    await this.modalController.dismiss(undefined);
  }

  private async initialyze(): Promise<void> {
    try {
      const { brightness } = await ScreenBrightness.getBrightness();
      this.brightnessOrigin = brightness;
      await ScreenBrightness.setBrightness({ brightness: 1 });
    } catch (error) {
      console.log(error);
    }
  }
}
