import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, Platform } from '@ionic/angular';

import { Idfa } from '@sparkfabrik/capacitor-plugin-idfa';

import { InteractiviteListModal } from '../../shared/modals/interactivite-list/interactivite-list.modal';
import { cloneDeep, shuffle } from 'lodash';

import { feedSessionsHTML, pushOnSessionToShow } from 'src/app/core/utils/home.utils';
import { State, Store } from '@ngrx/store';
import { DataFilter } from 'src/app/core/store/reducers/strapi.reducer';
import { Speaker } from 'src/app/core/models/speaker.interface';
import { AppConfig, DataConfig, DateCongress, TemplateConfig } from 'src/app/core/models/config.interface';
import { Schedule, ScheduleGroups } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { PhotoViewerService } from 'src/app/core/services/photo-viewer.service';
import { Router } from '@angular/router';
import { PersonalProgrammeService } from 'src/app/core/services/personal-programme.service';
import { removeHiddenSession } from 'src/app/core/utils/schedule.utils';
import { QrcodeModal } from 'src/app/shared/modals/qrcode-modal/qrcode-modal';
import { TimezoneGapService } from 'src/app/core/services/timezoneGap.service';
import { MapService } from 'src/app/core/services/map.service';
import { StatusBarService } from 'src/app/core/services/status-bar.service';
import { resetProgrammeScientificFilters } from 'src/app/core/utils/reset-filters.utils';
import { setProgrammeFiltersScientific } from 'src/app/core/store/actions/strapi.actions';
import { VerticalButton } from 'src/app/core/models/verticalButton.interface';
import { HappeningNowModal } from 'src/app/shared/modals/happening-now/happening-now.modal';
import { AppStoreState } from 'src/app/core/core.module';

interface ProgressSession extends Session {
  progress: number;
  decalage: number;
  decalageDays: number;
  decalageHours: number;
  decalageMins: number;
}

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.html',
  styleUrls: ['./home.scss'],
})
export class HomePage implements OnInit {
  public isCurrent: string;
  public sessionsToShow: { [kay: string]: Session };
  public sessionsHTML: Session[] = [];
  public actualDate: Date;
  public scheduleStorage: Schedule[] = [];
  public speakersStorage: Speaker[] = [];
  public speakersToShow: Speaker[] = [];
  public templateConfig: TemplateConfig;
  public dataConfig: DataConfig;
  public dateCongress: DateCongress;
  public appConfig: AppConfig;
  public isScanning = false;
  public isBadgeButtonDisplayed: boolean = false;
  public isVoucherButtonDisplayed: boolean = false;
  public favoritesSessions: ProgressSession[] = [];
  public headerChangeColor = true;
  public textHappeningNow: string = this.translate.instant('home.buttons.happening-now-text');
  public canShowSubCongresses: boolean = false;

  private subCongresses: DateCongress['subCongresses'] = [];
  private scientificFilters: DataFilter;
  private introjs?: NodeJS.Timeout;

  constructor(
    public translate: TranslateService,
    public modalController: ModalController,
    private store: Store<AppStoreState>,
    private state: State<AppStoreState>,
    private inAppBrowserService: InAppBrowserService,
    private photoViewerService: PhotoViewerService,
    private router: Router,
    private personalProgrammeService: PersonalProgrammeService,
    private timezoneGapService: TimezoneGapService,
    private mapService: MapService,
    private platform: Platform,
    private statusBarService: StatusBarService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      const config = strapi.config;
      this.appConfig = config.appConfig;
      this.dataConfig = config.dataConfig;
      this.dateCongress = config.dateCongress;
      this.templateConfig = config.templateConfig;
      this.scheduleStorage = removeHiddenSession(strapi.programme.schedule.scientific);
      this.speakersStorage = strapi.programme.speakers;
      this.scientificFilters = cloneDeep(strapi.programme.filters.scientific);
      this.subCongresses = strapi.config.dateCongress.subCongresses;

      if (strapi.config.appConfig.pages.home.subCongresses?.start && strapi.config.appConfig.pages.home.subCongresses?.end) {
        const now = new Date().getTime();
        const start = new Date(strapi.config.appConfig.pages.home.subCongresses.start).getTime();
        const end = new Date(strapi.config.appConfig.pages.home.subCongresses.end).getTime();
        this.canShowSubCongresses = now < end && now > start;
      }

      this.updateData();
    });
  }

  public onScroll(event: any): void {
    const element: any = document.querySelector('.contentHome');
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

  async initIDFA() {
    try {
      const response = await Idfa.getAdvertisingInfo();
      if (response.isAdTrackingLimited === true) {
        console.error('Ads tracking not allowed by user.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async openModalInteractiviteList(): Promise<void> {
    const modalIL = await this.modalController.create({
      component: InteractiviteListModal,
      componentProps: {},
      cssClass: 'modal-wrapper',
    });

    return await modalIL.present();
  }

  public async displayBadge(): Promise<void> {
    const data = { qrcode: 'https://google.com' };

    if (data && data.qrcode) {
      const modalIL = await this.modalController.create({
        component: QrcodeModal,
        componentProps: {
          qrcode: decodeURIComponent(data.qrcode),
        },
        cssClass: 'modal-wrapper',
      });

      return await modalIL.present();

      // this.inAppBrowserService.openUrl(environment.badgeURL.replace('REFERENCE', data.reference));
    }
  }

  public openUrlInscription(): void {
    this.inAppBrowserService.openUrl(this.appConfig.registrationUrl);
  }

  public getCountDownDays(tmpDate: Date): number {
    const diffSeconds = (tmpDate.getTime() - this.actualDate.getTime()) / 1000;
    return Math.floor(diffSeconds / 60 / 60 / 24);
  }

  public getCountDownHours(tmpDate: number): number {
    const diffSeconds = (tmpDate - this.actualDate.getTime()) / 1000;
    return Math.floor(diffSeconds / 60 / 60);
  }

  public getCountDownMins(tmpDate: number): number {
    const diffSeconds = (tmpDate - this.actualDate.getTime()) / 1000;
    return Math.floor(diffSeconds / 60);
  }

  public openUrl(urlToGO?: string): void {
    if (urlToGO) {
      this.inAppBrowserService.openUrl(urlToGO);
    }
  }

  public openEntityUrl(urlToGO?: string): void {
    if (urlToGO) {
      this.inAppBrowserService.openUrl(urlToGO);
    }
  }

  public async openModal(): Promise<void> {
    this.photoViewerService.show(
      'https://ressources-smartphone.europa-group.com/2022/' + this.dataConfig.congressNameWithoutSpace + '/plan_general.png',
      this.translate.instant('global.map')
    );
  }

  public sortFunction(a: { timeBeginTimeStamp: string }, b: { timeBeginTimeStamp: string }): 0 | 1 | -1 {
    if (!a) {
      return -1;
    }
    if (!b) {
      return 1;
    }

    if (parseInt(a.timeBeginTimeStamp, 10) === parseInt(b.timeBeginTimeStamp, 10)) {
      return 0;
    } else {
      return parseInt(a.timeBeginTimeStamp, 10) < parseInt(b.timeBeginTimeStamp, 10) ? -1 : 1;
    }
  }

  public async loadFavoritesSessions(): Promise<void> {
    const personalProgramme = this.personalProgrammeService.appearanceProgramme$.getValue();
    const generatedOffset = this.timezoneGapService.getTimezoneOffsetInMinutes() * 60;
    this.actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const newFavoritesSessions = [];

    let actualDay = 0;
    for (let j = 0; j < Object.keys(this.dateCongress.days).length; j++) {
      if (this.actualDate.getDate() === new Date(this.dateCongress.days[j]).getDate()) {
        actualDay = j;
      }
    }

    let dateTmpDebut = new Date(this.dateCongress.days[actualDay]);
    let dateTmpFin = new Date(this.dateCongress.days[actualDay]);

    let dateTmpFinTime = null;
    let dateTmpDebutTime = null;

    const stateValue2 = (await this.state.getValue()) as { favoriteSessions: Session[] };
    const stateValue = { favoriteSessions: [...(stateValue2.favoriteSessions ?? []), ...personalProgramme] };
    let dataStorage = stateValue.favoriteSessions
      ?.filter((f) => !!f)
      ?.filter((f, i, self) => self.findIndex((ff) => f.idSession === ff.idSession) === i)
      ? stateValue.favoriteSessions?.filter((f) => !!f)?.filter((f, i, self) => self.findIndex((ff) => f.idSession === ff.idSession) === i)
      : [];
    if (dataStorage && dataStorage.length) {
      let i = 0;

      dataStorage = dataStorage.sort(this.sortFunction);
      for (const data of dataStorage) {
        if (data) {
          dateTmpFin = new Date((parseInt(data.timeEndTimestamp, 10) + generatedOffset) * 1000);
          dateTmpFinTime = dateTmpFin.getTime();

          dateTmpDebut = new Date((parseInt(data.timeBeginTimeStamp, 10) + generatedOffset) * 1000);

          dateTmpDebutTime = dateTmpDebut.getTime();

          const progress = 1 - (dateTmpFinTime - this.actualDate.getTime()) / (dateTmpFinTime - dateTmpDebutTime);

          if (
            (progress < 1 &&
              new Date(this.actualDate).getDate() === new Date((parseInt(data.timeEndTimestamp, 10) + generatedOffset) * 1000).getDate()) ||
            new Date(this.actualDate).getTime() <= new Date((parseInt(data.timeEndTimestamp, 10) + generatedOffset) * 1000).getTime()
          ) {
            newFavoritesSessions.push({
              ...data,
              progress,
              decalage: Math.floor((this.actualDate.getTime() - dateTmpFin.getTime()) / 1000 / 60),
              decalageDays: Math.floor(this.getCountDownDays(dateTmpDebut)),
              decalageHours: Math.floor(this.getCountDownHours(dateTmpDebutTime)),
              decalageMins: Math.floor(this.getCountDownMins(dateTmpDebutTime)),
            });
            i++;

            if (i > 2) {
              break;
            }
          }
        }
      }
    }
    this.favoritesSessions = [...newFavoritesSessions];
  }

  public loadProgramme(): void {
    this.actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const generatedOffset = this.timezoneGapService.getTimezoneOffsetInMinutes() * 1000 * 60;
    const timestampActualDay = this.actualDate.getTime();

    this.isCurrent =
      this.actualDate < new Date(this.dateCongress.start)
        ? 'before'
        : this.actualDate > new Date(this.dateCongress.end)
        ? 'after'
        : 'current';

    this.sessionsToShow =
      this.appConfig?.pages?.home?.rooms?.reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue]: null,
        }),
        {}
      ) ?? {};

    if (this.isCurrent === 'current' || this.isCurrent === 'before') {
      let newIsCurrent = 'before';

      for (const room of this.appConfig?.pages?.home?.rooms ?? []) {
        const availableSessions = [];

        // retrieve all sessions in room
        for (const [dateGroupKey, dateGroup] of Object.entries<Schedule>(this.scheduleStorage)) {
          for (const group of Object.values<ScheduleGroups>(dateGroup.groups)) {
            for (const session of Object.values<Session>(group.sessions)) {
              if (session.room === room) {
                availableSessions.push({
                  ...session,
                  idDate: dateGroupKey,
                  startTimestampCalculated: new Date(parseInt(session.timeBeginTimeStamp, 10) * 1000).getTime() + generatedOffset,
                  endTimestampCalculated: new Date(parseInt(session.timeEndTimestamp, 10) * 1000).getTime() + generatedOffset,
                });
              }
            }
          }
        }

        if (availableSessions.length >= 1) {
          // sort sessions by start timestamp
          availableSessions.sort((a, b) => a.startTimestampCalculated - b.startTimestampCalculated);
          let session;

          if (this.isCurrent === 'before') {
            session = availableSessions[0];
            newIsCurrent = 'before';
          } else {
            for (const availableSession of availableSessions) {
              if (
                availableSession.startTimestampCalculated <= timestampActualDay &&
                availableSession.endTimestampCalculated >= timestampActualDay
              ) {
                newIsCurrent = 'current';
                session = availableSession;
                break;
              }

              if (availableSession.startTimestampCalculated > timestampActualDay) {
                session = availableSession;
                break;
              }
            }
          }

          if (session) {
            const offset = this.timezoneGapService.getTimezoneOffsetInMinutes();
            pushOnSessionToShow(this.sessionsToShow, session, this.actualDate, offset);
          }
        }
      }

      newIsCurrent = 'before';
      for (const s of Object.values(this.sessionsToShow)) {
        if (s?.decalageMins <= 0) {
          newIsCurrent = 'current';
          break;
        }
      }

      this.isCurrent = newIsCurrent;
      this.sessionsHTML = [];
      feedSessionsHTML(this.sessionsHTML, this.sessionsToShow);
      this.sessionsHTML.sort((a, b) => {
        if ((!a && !b) || (!a.decalage && !b.decalage)) {
          return 0;
        }
        if (!a || !a.decalage) {
          return -1;
        }
        if (!b || !b.decalage) {
          return 1;
        }
        return b.decalage - a.decalage;
      });

      this.textHappeningNow = newIsCurrent ? this.sessionsHTML?.[0]?.title : this.translate.instant('home.buttons.happening-now-text');
    }
  }

  public clickNews(): void {
    resetProgrammeScientificFilters(this.scientificFilters);
    this.scientificFilters?.tracks.forEach((v) => {
      if (v.val === 'Session paramédicale') {
        v.isChecked = true;
      }
    });

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.scientificFilters }));
    setTimeout(() => {
      this.router.navigate(['/app/tabs/programme']);
    });
  }

  public clickYouthSpecial(): void {
    resetProgrammeScientificFilters(this.scientificFilters);
    this.scientificFilters?.tracks?.forEach((v) => {
      if (v.val === 'Tournoi des jeunes - TJT') {
        v.isChecked = true;
      }
      if (v.val === 'Concours de pédagogie JNJP') {
        v.isChecked = true;
      }
    });

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.scientificFilters }));
    setTimeout(() => {
      this.router.navigate(['/app/tabs/programme']);
    });
  }

  public loadSpeakers(): void {
    this.speakersToShow = [];

    if (this.speakersStorage) {
      const shuffledSpeakers = shuffle(this.speakersStorage).slice(0, 10);

      shuffledSpeakers?.forEach((speaker) => {
        this.speakersToShow.push(speaker);
      });
    }
  }

  public ionViewWillEnter(): void {
    this.updateData();
  }

  public ionViewWillLeave(): void {
    if (this.introjs) {
      clearTimeout(this.introjs);
    }
  }

  public async ngOnInit(): Promise<void> {
    this.initIDFA();
  }

  public updateData(): void {
    this.checkBadgeVisibility();
    this.loadProgramme();
    this.loadSpeakers();
    this.loadFavoritesSessions();
  }

  public goToMap(): void {
    this.router.navigate(['/app/tabs/interactive-global-map']);
  }

  public openInteractiveMap(): void {
    this.mapService.view.next('PLAN');
    this.router.navigateByUrl('/app/tabs/exposants');
  }

  public openProgramme(): void {
    this.router.navigate(['/app/tabs/programme']);
  }

  public openModalPracticalInformation() {
    this.router.navigate(['/app/tabs/about']);
  }

  public goToInteractivity() {
    this.router.navigate(['/app/tabs/interactivite-detail/jnlf']);
  }

  public getInitials(speaker: Speaker): string {
    if (!speaker) {
      return ' ';
    }

    return `${speaker.firstName?.charAt(0) ?? ''}${speaker.lastName?.charAt(0) ?? ''}`.toLocaleUpperCase();
  }

  public openUniqueSlide(): void {
    if (this.appConfig?.links?.uniqueSlide) {
      this.inAppBrowserService.openUrl(this.appConfig.links.uniqueSlide);
    }
  }

  public async openModalHappeningNow(): Promise<void> {
    const modal = await this.modalController.create({
      component: HappeningNowModal,
      componentProps: {
        sessions: this.sessionsHTML,
      },
      cssClass: 'modal-wrapper',
    });

    return await modal.present();
  }

  public async showSubCongresses(): Promise<void> {
    this.router.navigate([this.subCongresses?.[0]?.route]);
  }

  public clickMainButton(mainButton: VerticalButton): void {
    if (mainButton.click?.method) {
      switch (mainButton.click.method) {
        case 'openModalInteractiviteList': {
          this.openModalInteractiviteList();
          break;
        }
        case 'openInteractiveMap': {
          this.openInteractiveMap();
          break;
        }
        case 'openModalPracticalInformation': {
          this.openModalPracticalInformation();
          break;
        }
        case 'goToInteractivity': {
          this.goToInteractivity();
          break;
        }
        case 'openProgramme': {
          this.openProgramme();
          break;
        }
        case 'showSubCongresses': {
          this.showSubCongresses();
          break;
        }
        case 'openModalHappeningNow': {
          this.openModalHappeningNow();
          break;
        }
      }
    }
  }

  private async checkBadgeVisibility(): Promise<void> {
    this.isBadgeButtonDisplayed = true;
  }
}
