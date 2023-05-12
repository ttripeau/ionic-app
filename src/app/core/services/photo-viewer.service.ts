/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PhotoviewerModal } from 'src/app/shared/modals/photoviewer/photoviewer.component';

@Injectable({
  providedIn: 'root',
})
export class PhotoViewerService {
  constructor(private modalController: ModalController) {}

  public async show(url: string, text: string): Promise<void> {
    const modal = await this.modalController.create({
      component: PhotoviewerModal,
      componentProps: {
        text,
        url,
      },
    });

    await modal.present();
  }
}
