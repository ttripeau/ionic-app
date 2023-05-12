import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.modal.html',
  styleUrls: ['./plan.modal.scss'],
})
export class PlanModal {
  sliderOpt = {
    initialSlide: 0,
    speed: 400,
    loop: true,
    zoom: {
      minRatio: 1,
      maxRatio: 3,
      toggle: true,
      containerClass: 'swiper-zoom-container',
      zoomedSlideClass: 'swiper-slide-zoomed',
    },
  };

  constructor(private modalController: ModalController) {}

  public async closeModal(): Promise<void> {
    await this.modalController.dismiss();
  }
}
