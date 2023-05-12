import { Component, Inject, ViewChild } from '@angular/core';
import { DataConfig, DateCongress, Filter, TemplateConfig } from 'src/app/core/models/config.interface';
import { IonContent, IonList, IonRouterOutlet, ModalController, ToastController } from '@ionic/angular';
import { State, Store } from '@ngrx/store';
import { cloneDeep, merge } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { FavoriteSessionInterface } from 'src/app/core/store/reducers/my-program.reducer';
import { FiltersModal } from 'src/app/shared/modals/filters/filters.modal';
import { FavoriteSessionDay, Schedule } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { TranslateService } from '@ngx-translate/core';
import { resetProgrammeScientificFilters } from 'src/app/core/utils/reset-filters.utils';
import { removeHiddenSession, scheduleSessions } from 'src/app/core/utils/schedule.utils';
import { setProgrammeFiltersScientific } from 'src/app/core/store/actions/strapi.actions';
import { InfiniteScrollCustomEvent } from 'src/app/core/models/infinite-scrolll-custom-event.interface';
import { PersonalProgrammeService } from 'src/app/core/services/personal-programme.service';
import { DOCUMENT } from '@angular/common';
import { TimezoneGapService } from 'src/app/core/services/timezoneGap.service';

export interface FilterSelectedInterface {
  key: string;
  value: (string | number)[];
}
@Component({
  selector: 'app-page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage {
  // Gets a reference to the list element
  @ViewChild('scheduleList', { static: true }) scheduleList: IonList;
  @ViewChild(IonContent, { static: false }) content: IonContent;

  public dateCongress: DateCongress;
  public dataConfig: DataConfig;
  public templateConfig: TemplateConfig;
  public dayIndex = 0;
  public filterDays: Filter[] = [];
  public filterTopics: string[] = [];
  public filterTracks: string[] = [];
  public filterFocuses: string[] = [];
  public filterInitTopics: boolean = false;
  public filterInitTracks: boolean = false;
  public filterInitFocuses: boolean = false;
  public filtersSelected: FilterSelectedInterface[] = [];
  public sessionsToShow: FavoriteSessionDay[] = [];
  public sessionsToShowStorage: FavoriteSessionDay[] = [];
  public sessionsToShowStorageIndex: number = 0;
  public sessionsToShowStorageInnerIndex: number[] = [];
  public sessionsToShowSize: number = 5 as const;
  public listFavorites: FavoriteSessionInterface[] = [];
  public isLoading = true;
  public showFilters = false;
  public isSpecialYouth = false;
  public specialYouthText?: string = '';
  public isNews = false;
  public newsText?: string = '';
  public showLoadMore = true;
  public filtersConfig: { [key: string]: Filter[] } = {};

  private sessionsStrapi: Schedule[] = [];
  private personalProgramme: Session[] = [];
  private sessionsStorage: Schedule[] = [];
  private hasTypingSearch = false;
  private oldFiltersConfig = '';
  private needUpdate = 0;
  private doc;

  constructor(
    private translate: TranslateService,
    private modalController: ModalController,
    private toastController: ToastController,
    private routerOutlet: IonRouterOutlet,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ strapi: StrapiStateInterface; favoriteSessions: FavoriteSessionInterface[] }>,
    private state: State<{ favoriteSessions: FavoriteSessionInterface[] }>,
    private personalProgrammeService: PersonalProgrammeService,
    @Inject(DOCUMENT) document: Document,
    private timezoneGapService: TimezoneGapService
  ) {
    this.doc = document;
    this.store.select('strapi').subscribe((strapi) => {
      this.init(strapi);
      this.content?.scrollToTop();
      this.filterInitTopics = true;
      this.filterInitTracks = true;
      this.filterInitFocuses = true;
      this.filterTopics = this.getSelectValue(this.filtersConfig.topics);
      this.filterTracks = this.getSelectValue(this.filtersConfig.tracks);
      this.filterFocuses = this.getSelectValue(this.filtersConfig.focuses);
    });

    this.personalProgrammeService.appearanceProgramme$.subscribe((value) => {
      this.personalProgramme = value;
      this.initSchedule(false);
    });
  }

  public ionViewWillEnter(): void {
    this.filterInitTopics = false;
    this.filterInitTracks = false;
    this.filterInitFocuses = false;
    const stateValue = this.state.getValue();
    const favoriteSessions = stateValue.favoriteSessions;
    this.listFavorites = favoriteSessions?.filter((f: Session) => !!f) ? favoriteSessions?.filter((f: Session) => !!f) : [];
    this.updateFavorites();
  }

  public init(strapi: StrapiStateInterface, showToast: boolean = true) {
    this.dataConfig = strapi.config.dataConfig;
    this.dateCongress = strapi.config.dateCongress;
    this.templateConfig = strapi.config.templateConfig;
    this.filterDays = cloneDeep(strapi.programme.filters.scientific.days);
    this.filtersConfig = cloneDeep(strapi.programme.filters.scientific);
    this.specialYouthText = strapi.config.appConfig.texts?.specialYouth;
    this.newsText = strapi.config.appConfig.texts?.news;

    const params = this.activatedRoute.snapshot.queryParams;
    if (params.queryText) {
      resetProgrammeScientificFilters(this.filtersConfig);
      this.dataConfig.queryText.programme = decodeURIComponent(params.queryText);
    }

    const filteredKeys = Object.keys(this.filtersConfig)?.filter((v) => Object.keys(params).indexOf(v) >= 0);

    if (filteredKeys.length > 0) {
      resetProgrammeScientificFilters(this.filtersConfig);
      filteredKeys.forEach((filter) => {
        this.filtersConfig[filter].map((v) => {
          const pFilter = decodeURIComponent(params[filter]);
          if (Array.isArray(pFilter)) {
            v.isChecked = pFilter.indexOf(v.val) >= 0;
          } else {
            v.isChecked = `${v.val}` === `${pFilter}`;
          }
        });
      });
    }
    this.sessionsStrapi = cloneDeep(strapi.programme.schedule.scientific);
    this.initSchedule(showToast);
  }

  public mergeSessionPersonalSessionInProgramme(): Schedule[] {
    for (const day of this.sessionsStrapi) {
      for (const group of day.groups) {
        for (const session of group.sessions) {
          if (this.personalProgramme.findIndex((value) => value.idSession === session.idSession) >= 0) {
            session.doIAppear = true;
          }
        }
      }
    }
    return this.sessionsStrapi;
  }

  public async initSchedule(showToast: boolean): Promise<void> {
    const schedule = this.mergeSessionPersonalSessionInProgramme();

    if (this.oldFiltersConfig !== JSON.stringify(this.filtersConfig)) {
      this.setDay();
      this.sessionsToShow = [];
      this.sessionsStorage = removeHiddenSession(schedule);
      await this.getListFavorites();
      this.sortSessions();
      this.syncFilters();
      this.updateSchedule(showToast);
    }
  }

  public syncFilters(): void {
    let showFiltersTemp = false;
    this.filtersSelected = [];
    for (const [key, value] of Object.entries<Filter[]>(this.filtersConfig)) {
      if (key !== 'days') {
        showFiltersTemp = showFiltersTemp || value?.filter((f) => f.isChecked).length > 0;
        this.filtersSelected.push({
          key,
          value: value?.filter((f) => f.isChecked).map((v) => v.val),
        });
      }
    }
    const order = ['targetedAudience', 'topics', 'tracks', 'themes', 'sponsors', 'sponsored', 'room', 'hub', 'focuses', 'special'];
    this.filtersSelected = this.filtersSelected.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

    this.showFilters = showFiltersTemp;
  }

  public sortSessions(): void {
    for (const day of this.sessionsStorage) {
      if (day?.groups) {
        for (const group of day.groups) {
          if (group?.sessions) {
            group.sessions.sort((a, b) => {
              if (!a || !b) {
                return 0;
              }
              if (a.timeBeginTimeStamp !== b.timeBeginTimeStamp) {
                return parseInt(a.timeBeginTimeStamp, 10) - parseInt(b.timeBeginTimeStamp, 10);
              }
              // if (a.timeEndTimestamp !== b.timeEndTimestamp) {
              //   return parseInt(a.timeEndTimestamp, 10) - parseInt(b.timeEndTimestamp, 10);
              // }
              // if (a.reference !== b.reference) {
              //   return a.reference?.localeCompare(b.reference);
              // }
              if (a.room && b.room) {
                if (this.dataConfig.sortedRoom.indexOf(a.room) < 0 && this.dataConfig.sortedRoom.indexOf(a.room) < 0) {
                  return 0;
                }
                if (this.dataConfig.sortedRoom.indexOf(a.room) < 0) {
                  return -1;
                }
                if (this.dataConfig.sortedRoom.indexOf(b.room) < 0) {
                  return 1;
                }

                return this.dataConfig.sortedRoom.indexOf(a.room) - this.dataConfig.sortedRoom.indexOf(b.room);
              }
              return 0;
            });
          }
        }
      }
    }
  }

  public updateSearch(): void {
    this.hasTypingSearch = true;
  }

  public async search(): Promise<void> {
    if (this.hasTypingSearch) {
      this.dayIndex = 999;
      this.hasTypingSearch = false;
    }
    this.updateSchedule(true);
  }

  public async getListFavorites(): Promise<void> {
    const value = await this.state.getValue();
    this.listFavorites = value.favoriteSessions?.filter((f: Session) => !!f) ? value.favoriteSessions?.filter((f: Session) => !!f) : [];
  }

  public setDay(): void {
    let actualDay = null;
    for (const value of Object.values<Filter>(this.filterDays)) {
      if (value.isChecked) {
        actualDay = value.val;
        break;
      }
    }

    if (actualDay === null) {
      const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();

      actualDay = undefined;
      for (const value of Object.values(this.filterDays)) {
        if (value.data) {
          const valueDate = new Date(value.data);
          valueDate.setHours(23);
          valueDate.setMinutes(59);
          if (actualDate.getTime() <= valueDate.getTime()) {
            actualDay = value.val;
            break;
          }
        }
      }
      if (actualDay === undefined) {
        actualDay = 0;
        for (const [key, value] of Object.entries<string>(this.dateCongress.days)) {
          if (actualDate.getDate() === new Date(value).getDate()) {
            actualDay = parseInt(key, 10);
            break;
          }
        }
      }
    }

    this.dayIndex = actualDay as number;
  }

  public async openModalFilterSessions(): Promise<void> {
    this.oldFiltersConfig = JSON.stringify(this.filtersConfig);

    const modal = await this.modalController.create({
      component: FiltersModal,
      componentProps: {
        filters: cloneDeep(this.filtersConfig),
        config: [
          {
            val: 'targetedAudience',
            icon: { name: 'people-outline' },
          },
          // {
          //   val: 'topics',
          //   background: '/assets/img/filters/topics.png',
          //   icon: { src: '/assets/icon/icon_themes-topics.svg' },
          // },
          // {
          //   val: 'tracks',
          //   background: '/assets/img/filters/session-format.png',
          //   icon: { src: '/assets/icon/icon_type.svg' },
          // },
          {
            val: 'room',
            background: '/assets/img/filters/room.png',
            icon: { src: '/assets/icon/icon_presentation_light.svg' },
          },
          {
            val: 'sponsors',
            background: '/assets/img/filters/sponsor.png',
            icon: { name: 'ribbon-outline' },
          },
          {
            val: 'sponsored',
            background: '/assets/img/filters/sponsor.png',
            icon: { name: '/assets/icon/icon_sponsor.svg' },
          },
          {
            val: 'hub',
            background: '/assets/img/filters/hub.png',
            icon: { src: '/assets/icon/icon_hub.svg' },
          },
          // {
          //   val: 'focuses',
          //   background: '/assets/img/filters/focus-on.png',
          //   icon: { src: '/assets/icon/icon_focus.svg' },
          // },
          // {
          //   val: 'themes',
          //   icon: { name: 'bookmark-outline' },
          // },
          {
            val: 'special',
            icon: { name: 'bookmark-outline' },
          },
        ],
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      cssClass: 'modal-wrapper',
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      if (dataReturned.role === 'gesture' || dataReturned?.data?.isDismiss) {
        return;
      }

      if (dataReturned?.data !== undefined && dataReturned?.data?.filters) {
        this.store.dispatch(
          setProgrammeFiltersScientific({
            filters: merge({}, this.filtersConfig, dataReturned.data.filters),
          })
        );
        this.dayIndex = 999;
        this.updateSchedule(true);
      }
    });

    return await modal.present();
  }

  public deleteFilter(filter: string | number, list: string): void {
    const t = this.filtersConfig[list].find((a) => a.val === filter);
    if (t) {
      t.isChecked = false;
    }

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.filtersConfig }));

    const badgeToFilter = this.filtersSelected.find((f) => f.key === list);
    if (badgeToFilter) {
      badgeToFilter.value = badgeToFilter.value?.filter((f) => f !== filter);
    }
  }

  public updateDay(): void {
    this.filterDays = this.filterDays.map((d) => ({
      ...d,
      isChecked: parseInt(`${d.val}`, 10) === parseInt(`${this.dayIndex}`, 10),
    }));

    this.store.dispatch(
      setProgrammeFiltersScientific({
        filters: merge({}, this.filtersConfig, { days: this.filterDays }),
      })
    );
  }

  public async updateSchedule(showToast: boolean): Promise<void> {
    this.needUpdate++;
    const needUpdate = this.needUpdate;
    this.isLoading = true;
    const queryText = this.dataConfig.queryText.programme.toLowerCase().replace(/,|\.|-/g, ' ');
    this.sessionsToShow = [];

    let scheduledSessions: { sessionsToShow: FavoriteSessionDay[]; countSessionsFound: number } = scheduleSessions(
      this.dateCongress,
      this.dayIndex,
      this.sessionsStorage,
      queryText,
      this.listFavorites,
      this.filtersSelected,
      false
    );

    if (scheduledSessions.countSessionsFound <= 0) {
      scheduledSessions = scheduleSessions(
        this.dateCongress,
        this.dayIndex,
        this.sessionsStorage,
        queryText,
        this.listFavorites,
        this.filtersSelected,
        true
      );
    }

    this.sessionsToShowStorage = scheduledSessions.sessionsToShow;
    this.sessionsToShowStorageIndex = 0;
    this.sessionsToShowStorageInnerIndex = Array.from(Array(this.sessionsToShowStorage.length)).map(() => 0);
    this.sessionsToShow = [];

    if (this.sessionsToShowStorage.length > 0) {
      for (let i = 0; i < this.sessionsToShowStorage.length; i++) {
        this.sessionsToShowStorageIndex = i;
        this.sessionsToShowStorageInnerIndex[i] = this.sessionsToShowSize;
        const group = cloneDeep(this.sessionsToShowStorage[this.sessionsToShowStorageIndex]);
        group.sessions = group.sessions.slice(0, this.sessionsToShowSize);
        this.sessionsToShow = [...this.sessionsToShow, group];
        if (this.sessionsToShow.map((s) => s.sessions.length).reduce((prev, curr) => prev + curr, 0) >= this.sessionsToShowSize) {
          break;
        }
      }
    }

    this.showLoadMore = true;
    this.isLoading = false;

    this.updateDataWhenHasCurrentSession(needUpdate);

    let isEmpty = true;
    for (const filters of this.filtersSelected) {
      if (filters.value.length > 0) {
        isEmpty = false;
        break;
      }
    }

    this.isSpecialYouth = this.filtersConfig?.tracks?.find((f) => f.val === 'Tournoi des jeunes - TJT')?.isChecked ?? false;
    this.isNews = this.filtersConfig?.targetedAudience?.find((f) => f.val === 'Paramédicaux')?.isChecked ?? false;

    if (showToast && (queryText.length || !isEmpty)) {
      const toast = await this.toastController.create({
        message: scheduledSessions.countSessionsFound + this.translate.instant('programme.session-found'),
        duration: 2000,
        color: 'light',
        cssClass: 'tabs-bottom',
      });
      toast.present();
    }
  }

  public getChipIcon(type: string, filter: string | number): { name?: string; src?: string } {
    if (type === 'room') {
      return { src: 'assets/icon/icon_presentation_light.svg' };
    }
    if (type === 'topics' || type === 'theme') {
      return { src: 'assets/icon/icon_themes-topics.svg' };
    }
    if (type === 'sponsors') {
      return { src: 'assets/icon/icon_sponsor.svg' };
    }
    if (type === 'tracks') {
      return {
        src:
          `${filter}`.toLowerCase().includes('Learning'.toLowerCase()) || `${filter}`.toLowerCase().includes('LIVE Case'.toLowerCase())
            ? `${filter}`.toLowerCase().includes('Learning'.toLowerCase())
              ? 'assets/icon/icon_learning.svg'
              : 'assets/icon/icon_live.svg'
            : 'assets/icon/icon_type.svg',
      };
    }
    if (type === 'hub') {
      return { src: 'assets/icon/icon_hub.svg' };
    }
    if (type === 'focuses') {
      return { src: 'assets/icon/icon_focus.svg' };
    }
    if (type === 'themes') {
      return { name: 'bookmark-outline' };
    }
    if (type === 'targetedAudience') {
      return { name: 'people-outline' };
    }

    return { name: 'bookmark-outline' };
  }

  public clickNews(): void {
    resetProgrammeScientificFilters(this.filtersConfig);
    this.filtersConfig?.tracks.forEach((v) => {
      if (v.val === 'Session paramédicale') {
        v.isChecked = true;
      }
    });

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.filtersConfig }));
  }

  public clickYouthSpecial(): void {
    resetProgrammeScientificFilters(this.filtersConfig);
    this.filtersConfig.tracks.forEach((v) => {
      if (v.val === 'Tournoi des jeunes - TJT') {
        v.isChecked = true;
      }
      if (v.val === 'Concours de pédagogie JNJP') {
        v.isChecked = true;
      }
    });

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.filtersConfig }));
  }

  public loadData(e: Event): Promise<boolean> {
    const event = e as InfiniteScrollCustomEvent;

    return new Promise((resolve) => {
      setTimeout(async () => {
        const isResolve = await this.loadDataInner(this.sessionsToShowStorageIndex);
        if (!isResolve) {
          event.target?.complete();
          resolve(false);
          return;
        }
        this.sessionsToShowStorageIndex++;
        if (this.sessionsToShowStorage[this.sessionsToShowStorageIndex]) {
          this.sessionsToShowStorageInnerIndex[this.sessionsToShowStorageIndex] = this.sessionsToShowSize;
          const group = cloneDeep(this.sessionsToShowStorage[this.sessionsToShowStorageIndex]);
          group.sessions = group.sessions.slice(0, this.sessionsToShowSize);
          this.sessionsToShow = [...this.sessionsToShow, group];
        }
        event.target?.complete();

        if (this.sessionsToShowStorage.length - 1 <= this.sessionsToShowStorageIndex) {
          if (event.target) {
            event.target.disabled = true;
          }
          resolve(true);
        } else {
          resolve(false);
        }
      }, 0);
    });
  }

  public loadDataInner(indexSessionToShow: number): Promise<boolean> {
    const indexOfSession = this.sessionsToShowStorageInnerIndex[indexSessionToShow];
    const group = cloneDeep(this.sessionsToShowStorage[indexSessionToShow]);

    return new Promise((resolve) => {
      if (!this.sessionsToShow[indexSessionToShow]?.sessions) {
        resolve(true);
        return;
      }

      this.sessionsToShow[indexSessionToShow].sessions = [
        ...this.sessionsToShow[indexSessionToShow].sessions,
        ...group.sessions.slice(indexOfSession, indexOfSession + this.sessionsToShowSize),
      ];

      this.sessionsToShowStorageInnerIndex[indexSessionToShow] += this.sessionsToShowSize;

      if (this.sessionsToShowStorage[indexSessionToShow].sessions.length <= this.sessionsToShowStorageInnerIndex[indexSessionToShow]) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public getDayTranslated(date: string): string {
    const res = new Date(date).toLocaleDateString(this.translate.currentLang, { weekday: 'long' });
    return res.charAt(0).toUpperCase() + res.slice(1);
  }

  public selectionChangeTopics(event: any): void {
    if (this.filterInitTopics) {
      this.filterInitTopics = false;
      return;
    }

    const newFilters = cloneDeep(this.filtersConfig);
    for (const filter of newFilters.topics) {
      filter.isChecked = event.detail.value.includes(filter.val);
    }

    this.store.dispatch(
      setProgrammeFiltersScientific({
        filters: merge({}, this.filtersConfig, newFilters),
      })
    );
    this.dayIndex = 999;
    this.updateSchedule(false);
  }

  public selectionChangeTracks(event: any): void {
    if (this.filterInitTracks) {
      this.filterInitTracks = false;
      return;
    }

    const newFilters = cloneDeep(this.filtersConfig);
    for (const filter of newFilters.tracks) {
      filter.isChecked = event.detail.value.includes(filter.val);
    }

    this.store.dispatch(
      setProgrammeFiltersScientific({
        filters: merge({}, this.filtersConfig, newFilters),
      })
    );
    this.dayIndex = 999;
    this.updateSchedule(false);
  }

  public selectionChangeFocuses(event: any): void {
    if (this.filterInitFocuses) {
      this.filterInitFocuses = false;
      return;
    }

    const newFilters = cloneDeep(this.filtersConfig);
    for (const filter of newFilters.focuses) {
      filter.isChecked = event.detail.value.includes(filter.val);
    }

    this.store.dispatch(
      setProgrammeFiltersScientific({
        filters: merge({}, this.filtersConfig, newFilters),
      })
    );
    this.dayIndex = 999;
    this.updateSchedule(false);
  }

  public getSelectValue(filters: Filter[]): string[] {
    return filters?.filter((f) => f.isChecked).map((f) => `${f.val}`) ?? [];
  }

  private goToFirstSessionNotPassed(): void {
    const timezoneOffsetInMinutes = this.timezoneGapService.getTimezoneOffsetInMinutes();
    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const items: Element[] = [];
    this.doc.querySelectorAll('.session-item').forEach((v) => items.push(v));

    let lastSession: Element | undefined;
    for (const item of items) {
      if (new Date((parseInt(item.id.split('-')?.[3] ?? 0, 10) + timezoneOffsetInMinutes * 60) * 1000).getTime() > actualDate.getTime()) {
        lastSession?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      lastSession = item;
    }
  }

  private async updateDataWhenHasCurrentSession(needUpdate: number) {
    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const timezoneOffsetInMinutes = this.timezoneGapService.getTimezoneOffsetInMinutes();
    let allSessions: Session[] = [];
    this.sessionsToShowStorage.forEach((group) => {
      allSessions = [...allSessions, ...group.sessions];
    });
    const hasCurrentSessions = allSessions.some(
      (s) => new Date((parseInt(s.timeEndTimestamp, 10) + timezoneOffsetInMinutes * 60) * 1000).getTime() > actualDate.getTime()
    );
    const hasAllCurrentSessions = allSessions.every(
      (s) => new Date((parseInt(s.timeEndTimestamp, 10) + timezoneOffsetInMinutes * 60) * 1000).getTime() > actualDate.getTime()
    );

    if (hasCurrentSessions && !hasAllCurrentSessions) {
      this.showLoadMore = false;
      let resultLoadData = false;
      let resultLoadMoreOne = false;
      let i = 0;

      while (!resultLoadMoreOne && i < 10 && needUpdate === this.needUpdate) {
        resultLoadMoreOne = resultLoadData;
        let resultLoadDataInner = this.sessionsToShowStorage[i].sessions.length <= this.sessionsToShowStorageInnerIndex[i];
        let j = 1;

        while (!resultLoadDataInner && j < 100 && needUpdate === this.needUpdate) {
          resultLoadDataInner = await this.loadDataInner(i);
          j++;
        }

        resultLoadData = await this.loadData(new Event(''));
        i++;
      }
      setTimeout(() => {
        this.goToFirstSessionNotPassed();
      }, 50);
    }
  }

  private updateFavorites() {
    for (const halfday of this.sessionsToShow) {
      for (const session of halfday.sessions) {
        session.isfavorite = !!this.listFavorites.find((favorite) => favorite.idSession === session.idSession);
      }
    }
  }
}
