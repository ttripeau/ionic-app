import { Component, ViewEncapsulation } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { AppConfig, TemplateConfig } from 'src/app/core/models/config.interface';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AboutPage {
  public textContent: SafeHtml;
  public templateConfig: TemplateConfig;
  public text?: string;
  public appConfig: AppConfig;

  constructor(
    public popoverCtrl: PopoverController,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private inAppBrowserService: InAppBrowserService,
    private sanitizer: DomSanitizer
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
      this.appConfig = strapi.config.appConfig;
      this.textContent = this.sanitizer.bypassSecurityTrustHtml(strapi.generalInformation.about);
      this.text = strapi.config.appConfig.texts?.about;
    });
  }

  public async openURL(url: string): Promise<void> {
    this.inAppBrowserService.openUrl(url);
  }
}
