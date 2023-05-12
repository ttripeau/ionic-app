import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';

@Injectable({
  providedIn: 'root',
})
export class InAppBrowserService {
  public templateConfig: TemplateConfig;

  constructor(
    private store: Store<{ strapi: StrapiStateInterface }>
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
    });
  }

  public openUrl(url: string): void {
    Browser.open({
      url,
      toolbarColor: this.templateConfig.colorCongress,
      presentationStyle: 'fullscreen',
    });
  }
}
