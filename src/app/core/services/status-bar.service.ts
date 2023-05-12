import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { TemplateConfig } from '../models/config.interface';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';

@Injectable({
  providedIn: 'root',
})
export class StatusBarService {
  private templateConfig: TemplateConfig;
  private lastConfig: { color: string; style: Style } | undefined;

  constructor(private platform: Platform, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
    });
  }

  public setStatusFromGuard(color: string) {
    setTimeout(() => {
      switch (color) {
        case 'light':
          this.setLight();
          break;
        case 'white':
          this.setWhite();
          break;
        case 'splash':
          this.setSplashColor();
          break;
        case 'congress-bis':
          this.setCongressColorBis();
          break;
        case 'congress-ter':
          this.setCongressColorTer();
          break;
        default:
          this.setCongressColor();
      }
    });
  }

  /**
   * Change la couleur de fond de la barre de status en light et la police en noir
   */
  public setLight(save: boolean = true): void {
    this.changeStatusBarStyle('#f1f1f1', Style.Light, save);
  }

  /**
   * Change la couleur de fond de la barre de status en blanc et la police en noir
   */
  public setWhite(save: boolean = true): void {
    this.changeStatusBarStyle('#ffffff', Style.Light, save);
  }

  /**
   * Change la couleur de fond de la barre de status dans la couleur du congrés et la police en blanc
   */
  public setCongressColor(save: boolean = true): void {
    this.changeStatusBarStyle(this.templateConfig.colorCongress, Style.Dark, save);
  }

  /**
   * Change la couleur de fond de la barre de status dans la couleur du congrés  et la police en blanc
   */
   public setCongressColorBis(save: boolean = true): void {
    this.changeStatusBarStyle(this.templateConfig.colorCongressBis, Style.Dark, save);
  }

  /**
   * Change la couleur de fond de la barre de status dans la couleur du congrés  et la police en blanc
   */
  public setCongressColorTer(save: boolean = true): void {
    this.changeStatusBarStyle(this.templateConfig.colorCongressTer, Style.Dark, save);
  }

  /**
   * Change la couleur de fond de la barre de status dans la couleur du splash et la police en blanc
   */
  public setSplashColor(save: boolean = true): void {
    this.changeStatusBarStyle(this.templateConfig.colorSplash, Style.Dark, save);
  }

  /**
   * Change la couleur du fond de la barre de status avec une valeur personnalisée
   */
  public setCustomColor(color: string, style: Style, save: boolean = true): void {
    this.changeStatusBarStyle(color, style, save);
  }

  /**
   * Change le style de la barre de statut avec la dernière configuration connue
   */
  public setStyleWithLastConfig(): void {
    if (this.lastConfig) {
      this.changeStatusBarStyle(this.lastConfig.color, this.lastConfig.style, true);
    } else {
      this.setCongressColor();
    }
  }

  /**
   * Méthode générique pour changer le style de la barre de status
   */
  private changeStatusBarStyle(color: string, style: Style, save: boolean): void {
    this.lastConfig = save ? { color, style } : this.lastConfig;

    if (!this.platform.is('ios') && !this.platform.is('mobileweb')) {
      StatusBar.setBackgroundColor({ color });
    }

    if (!this.platform.is('mobileweb')) {
      StatusBar.setStyle({ style });
    }
  }
}
