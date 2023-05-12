import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { AppConfig, DataConfig, DateCongress } from 'src/app/core/models/config.interface';

@Component({
  selector: 'app-filtersession',
  templateUrl: './interactivite-list.modal.html',
  styleUrls: ['./interactivite-list.modal.scss'],
})
export class InteractiviteListModal implements OnInit {
  public tabRooms: DateCongress['interactivityRooms'] = [];
  public iconsTab = ['chatbubble-ellipses-outline', 'chatbubbles-outline', 'help-circle-outline', 'help-outline'];
  public iconsTabDefault = 'help-circle-outline';
  public dataConfig: DataConfig;
  public dateCongress: DateCongress;
  public appConfig: AppConfig;

  constructor(
    private modalController: ModalController,
    private router: Router,
    private store: Store<{ strapi: StrapiStateInterface }>,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
      this.dataConfig = strapi.config.dataConfig;
      this.dateCongress = strapi.config.dateCongress;
      this.tabRooms = this.dateCongress.interactivityRooms;
    });
  }

  public ngOnInit(): void {
    this.loadRooms();
  }

  public loadRooms(): void {
    this.tabRooms = this.dateCongress.interactivityRooms;
  }

  public async closeModal(): Promise<void> {
    await this.modalController.dismiss();
  }

  public goToSlidoDetail(keyRoom?: string): void {
    if (keyRoom) {
      this.router.navigate(['/app/tabs/interactivite-detail/' + keyRoom]);
      this.closeModal();
    }
  }

  public goToGoogleFormDetail(keyRoom?: string): void {
    if (keyRoom) {
      this.router.navigate(['/app/tabs/pcr-got-talent']);
      this.closeModal();
    }
  }
}
