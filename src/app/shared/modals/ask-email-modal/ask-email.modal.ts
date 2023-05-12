/* eslint-disable no-useless-escape */
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ask-email-modal',
  templateUrl: './ask-email.modal.html',
  styleUrls: ['./ask-email.modal.scss'],
})
export class AskEmailModal {
  public email: string = '';

  constructor(private modalController: ModalController) {}

  public async closeModal(): Promise<void> {
    await this.modalController.dismiss(undefined);
  }

  public async valid(): Promise<void> {
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regex.test(this.email)) {
      await this.modalController.dismiss(this.email);
    }
  }
}
