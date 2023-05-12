import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from '../../core/store/reducers/strapi.reducer';
import { AppConfig, DateCongress, Picture, TemplateConfig } from 'src/app/core/models/config.interface';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { Subscription } from 'rxjs';
import { AppUrlOpenService } from 'src/app/core/services/app-url-open.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {
  public appConfig: AppConfig;
  public dateCongress: DateCongress;
  public templateConfig: TemplateConfig;
  public splash: Picture;

  private securitySub = new Subscription();

  constructor(
    public modalController: ModalController,
    private router: Router,
    public translate: TranslateService,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private inAppBrowserService: InAppBrowserService,
    private appUrlOpenService: AppUrlOpenService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
      this.dateCongress = strapi.config.dateCongress;
      this.templateConfig = strapi.config.templateConfig;
      this.getSplash();
    });
  }

  public ionViewWillEnter(): void {
    if (this.appConfig.splash) {
      setTimeout(async () => {
        await SplashScreen.hide();
        this.securityRoute(this.appConfig.durationSplashScreen);
      }, 100);
    } else {
      this.securityRoute(2000);
    }
  }

  async goTo(link: string) {
    if (this.appUrlOpenService.appIsUrlOpen) {
      try {
        this.appUrlOpenService.useUrl();
      } catch (error) {
        console.log('🚀 ~ file: splash.page.ts:59 ~ SplashPage ~ goTo ~ error:', error);
      }
    } else {
      this.router.navigate([link], { replaceUrl: true });
    }
    await SplashScreen.hide();
  }

  goToHome() {
    this.goTo('/app/tabs/home');
  }

  securityRoute(duration: number) {
    setTimeout(() => {
      this.securitySub.add(
        this.store.select('strapi').subscribe((strapi) => {
          if (!strapi.splashIsLoading) {
            this.securitySub.unsubscribe();
            this.goToHome();
          }
        })
      );
    }, duration);
  }

  handleSplashClick() {
    if (this.splash?.link) {
      this.inAppBrowserService.openUrl(this.splash.link);
    }
  }

  getSplash(): void {
    const actualDay: Date = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const dateToString = `${actualDay.getFullYear()}-${(actualDay.getMonth() + 1 + '').padStart(2, '0')}-${(
      actualDay.getDate() + ''
    ).padStart(2, '0')}`;
    const picture = this.templateConfig.pictures.find((pic) => pic.date === dateToString);

    this.splash = picture
      ? picture.splash
      : this.templateConfig.pictures[0].date >= dateToString
      ? this.templateConfig.pictures[0].splash
      : this.templateConfig.pictures[this.templateConfig.pictures.length - 1].splash;
  }
}
