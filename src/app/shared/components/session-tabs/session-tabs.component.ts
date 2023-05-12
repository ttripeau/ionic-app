import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AppConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { InteractiviteListModal } from 'src/app/shared/modals/interactivite-list/interactivite-list.modal';

@Component({
  selector: 'app-session-tabs',
  templateUrl: './session-tabs.component.html',
  styleUrls: ['./session-tabs.component.scss'],
})
export class SessionTabsComponent {
  @Input() actualTab: string = '';

  public appConfig: AppConfig;
  public tabsToShow: any[] = [];

  private allTabs = [
    {
      key: 'schedule',
      route: '/app/tabs/programme',
      label: 'tabs.programme',
    },
    {
      key: 'schedule-training',
      route: '/app/tabs/programme/training',
      label: 'tabs.trainingvillage',
    },
    {
      key: 'my-programme',
      route: '/app/tabs/mes-sessions',
      label: 'tabs.messessions',
    },
    {
      key: 'vod',
      route: '/app/tabs/programme/vod',
      label: 'tabs.vod',
    },
  ];

  constructor(public router: Router, private modalController: ModalController, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;

      this.tabsToShow = this.allTabs.filter((tab) => this.appConfig.pages?.programme?.tabs?.includes(tab.key));
    });
  }

  public async openInteractivity(): Promise<void> {
    const modal = await this.modalController.create({
      component: InteractiviteListModal,
      componentProps: {},
      cssClass: 'modal-wrapper',
    });

    return await modal.present();
  }
}
