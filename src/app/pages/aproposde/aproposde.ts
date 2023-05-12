import { Component, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { AppConfig, TemplateConfig } from 'src/app/core/models/config.interface';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { StatusBarService } from 'src/app/core/services/status-bar.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-page-aproposde',
  templateUrl: 'aproposde.html',
  styleUrls: ['./aproposde.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AproposdePage {
  public contenttext: string;
  public templateConfig: TemplateConfig;
  public appConfig: AppConfig;
  public versionApp: string | null = null;
  public headerChangeColor = true;

  constructor(
    private platform: Platform,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private inAppBrowserService: InAppBrowserService,
    private statusBarService: StatusBarService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
      this.appConfig = strapi.config.appConfig;
    });

    this.getAppVersion();
  }

  public async getAppVersion(): Promise<void> {
    try {
      const info = await App.getInfo();
      this.versionApp = info.version;
    } catch (error) {
      console.log(error);
      this.versionApp = '';
    }
  }

  public onScroll(event: any): void {
    const element: any = document.querySelector('.contentAproposDe');
    let elementTop = element?.offsetTop ?? 230;

    if (this.platform.is('ios')) {
      elementTop -= 54;
    } else {
      elementTop -= 34;
    }

    this.headerChangeColor = event.detail.scrollTop < elementTop - 90;
    if (this.headerChangeColor) {
      this.statusBarService.setCongressColor();
    } else {
      this.statusBarService.setCongressColor();
    }
  }

  public openUrlAproposDe(urlToGo: string): void {
    this.inAppBrowserService.openUrl(urlToGo);
  }
}
