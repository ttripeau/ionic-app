import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CapacitorHttp } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';
import { Store } from '@ngrx/store';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class StyleService {
  public version: string = '1';

  private strapi: StrapiStateInterface;
  private isInit = false;

  constructor(@Inject(DOCUMENT) private document: Document, private storage: Storage, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe(async (strapi) => {
      this.strapi = strapi;
      this.launch();
    });
  }

  public async init(): Promise<void> {
    this.isInit = true;
    this.launch();
  }

  private async launch(): Promise<void> {
    if (!this.isInit || !this.strapi) {
      return;
    }
    try {
      const lastVersion = this.strapi.config.appConfig.styleSheetVersion;
      const currentVersion = await this.getVersion();

      if (currentVersion && currentVersion === lastVersion) {
        this.version = currentVersion;
      } else {
        this.version = lastVersion;
        this.setVersion(lastVersion);
      }

      const response = await CapacitorHttp.get({ url: `${environment.styleSheetURL}/styles-${this.version}.css` });
      if (response.status !== 200) {
        await this.setDefaultCssFile();

        return;
      }
      this.saveCssFile(response.data);
      const head = this.document.getElementsByTagName('head')[0];
      const link = head.getElementsByTagName('link').item(1);
      if (link) {
        link.href = `${environment.styleSheetURL}/styles-${this.version}.css`;
      }
    } catch (error) {
      await this.setDefaultCssFile();

      return;
    }
  }

  private async setDefaultCssFile() {
    const isCssFileExist = await this.isCssFileExist();
    if (isCssFileExist) {
      const head = this.document.getElementsByTagName('head')[0];
      const link = head.getElementsByTagName('link').item(1);
      const url = await Filesystem.getUri({ directory: Directory.Data, path: `assets/styles/version-${this.version}.css` });
      if (link) {
        link.href = url.uri;
      }
    }
  }

  private async getVersion(): Promise<string | null> {
    return await this.storage.get('styleSheetVersion');
  }

  private async setVersion(version: string): Promise<void> {
    await this.storage.set('styleSheetVersion', version);
  }

  private isCssFileExist(): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      try {
        await Filesystem.readFile({ directory: Directory.Data, path: `assets/styles/version-${this.version}.css` });
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
  }

  private async saveCssFile(data: string): Promise<void> {
    await Filesystem.writeFile({
      directory: Directory.Data,
      data,
      path: `assets/styles/version-${this.version}.css`,
      recursive: true,
    });
  }
}
