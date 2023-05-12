import { Component, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { InteractiviteListModal } from '../../shared/modals/interactivite-list/interactivite-list.modal';
import { IonTabs, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { Store } from '@ngrx/store';
import { AppConfig, DataConfig, TemplateConfig } from 'src/app/core/models/config.interface';
import { MenuTab } from 'src/app/core/models/menu-tab.interface';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { PhotoViewerService } from 'src/app/core/services/photo-viewer.service';
import { ConnectionService } from 'src/app/core/services/connection.service';
import { Location } from '@angular/common';
import { MapService } from 'src/app/core/services/map.service';
import { Abstract } from 'src/app/core/models/abstract.interface';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs-page.html',
  styleUrls: ['tabs-page.scss'],
})
export class TabsPage {
  @ViewChild('tabs', { static: false }) tabs: IonTabs;

  public noShowTabs: AppConfig['noShowTabs'];
  public templateConfig: TemplateConfig;
  public dataConfig: DataConfig;
  public menuTabs: MenuTab[] = [];
  public maxTab?: MenuTab;
  public abstracts: Abstract[] = [];
  public selectedTab: string = '';
  public isConnected: boolean = false;
  public isSplash: boolean = false;
  public showTab: boolean = false;
  public showFab: boolean = true;
  public isIos: boolean = true;

  private oldMenuTabs: string = '';

  constructor(
    private router: Router,
    public modalController: ModalController,
    public translate: TranslateService,
    private location: Location,
    private connectionService: ConnectionService,
    private photoViewerService: PhotoViewerService,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private inAppBrowserService: InAppBrowserService,
    private mapService: MapService,
    private platform: Platform
  ) {
    router.events.subscribe(() => {
      this.isSplash = this.location.path().includes('splash');
      this.showTab = this.showTabs();
    });

    this.connectionService.appIsOnline$.subscribe((state) => {
      this.isConnected = state;
      this.showTab = this.showTabs();
    });

    this.store.select('strapi').subscribe((strapi) => {
      this.noShowTabs = strapi.config.appConfig.noShowTabs;
      const tempOldMenuTabs = JSON.stringify(
        strapi.config.appConfig.menuTabs?.map((v) => (v.icon?.name ? v.icon.name : v.icon.src)).join(' | ')
      );
      if (strapi.config.appConfig.menuTabs && this.oldMenuTabs !== tempOldMenuTabs) {
        this.menuTabs = strapi.config.appConfig.menuTabs;
        this.maxTab = this.menuTabs?.find((tab) => tab.className === 'max-size');
        this.oldMenuTabs = tempOldMenuTabs;
      }
      this.dataConfig = strapi.config.dataConfig;
      this.templateConfig = strapi.config.templateConfig;
      this.abstracts = strapi.abstracts.content;
      this.showTab = this.showTabs();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedTab = event.url.startsWith('/app/tabs/interactivite-detail/') ? 'openModalInteractiviteList' : '';
      }
      this.showTab = this.showTabs();
    });

    if (!this.platform.is('mobileweb')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.showFab = false;
      });

      Keyboard.addListener('keyboardDidShow', () => {
        this.showFab = false;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        this.showFab = true;
      });

      Keyboard.addListener('keyboardDidHide', () => {
        this.showFab = true;
      });
    }
  }

  public ionViewWillEnter(): void {
    this.isIos = this.platform.is('ios');
  }

  public async openModalInteractiviteList(): Promise<void> {
    const modalIL = await this.modalController.create({
      component: InteractiviteListModal,
      componentProps: {},
      cssClass: 'modal-wrapper',
    });

    return await modalIL.present();
  }

  public setCurrentTab(): void {
    // this.selectedTab = this.tabs.getSelected() ?? '';
  }

  public showTabs(): boolean {
    if (!this.noShowTabs) {
      return false;
    }
    if (this.noShowTabs.length <= 0) {
      return false;
    }

    if (this.noShowTabs?.includes(this.router.url)) {
      return false;
    } else {
      const regexChat = new RegExp('/app/tabs/chat/');
      if (regexChat.test(this.router.url)) {
        return false;
      } else {
        return true;
      }
    }
  }

  public openAbstractList(): void {
    // !! Work only when the abstract url in first abstract
    if (this.abstracts && this.abstracts[0] && this.abstracts[0].reference) {
      this.inAppBrowserService.openUrl(this.abstracts[0].reference);
    }
  }

  public switchExhibitorView(): void {
    this.mapService.view.next('LIST');
  }

  public async openplanModal(): Promise<void> {
    this.photoViewerService.show(
      'https://ressources-smartphone.europa-group.com/2022/' + this.dataConfig.congressNameWithoutSpace + '/plan_general.jpg',
      this.translate.instant('global.map')
    );
  }

  public clickMenuTab(tab: MenuTab): void {
    if (tab.click?.method) {
      switch (tab.click.method) {
        case 'openModalInteractiviteList': {
          this.openModalInteractiviteList();
          break;
        }
        case 'openAbstractList': {
          this.openAbstractList();
          break;
        }
        case 'openplanModal': {
          this.openplanModal();
          break;
        }
      }
    }
  }
}
