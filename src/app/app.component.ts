/* eslint-disable max-len */
import { AppConfig, DataConfig, DateCongress, Picture, TemplateConfig } from 'src/app/core/models/config.interface';
import { Component, NgZone, OnInit } from '@angular/core';
import { DataFilter, StrapiStateInterface, initialState } from './core/store/reducers/strapi.reducer';
import { MenuController, ModalController, Platform } from '@ionic/angular';
import { setProgrammeFiltersScientific, setStrapi } from './core/store/actions/strapi.actions';
import { Abstract } from 'src/app/core/models/abstract.interface';
import { ConferenceDataService } from './core/services/conference-data.service';
import { InAppBrowserService } from './core/services/in-app-browser.service';
import { InteractiviteListModal } from './shared/modals/interactivite-list/interactivite-list.modal';
import { MyProgramService } from './core/services/my-program.service';
import { PhotoViewerService } from './core/services/photo-viewer.service';
import { Router } from '@angular/router';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Storage } from '@ionic/storage-angular';
import { State, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { MapService } from './core/services/map.service';
import { StyleService } from './core/services/style.service';
import { InitializeAppService } from './core/services/initialize.app.service';
import { SqliteDatabaseService } from './core/services/sqlite-database.service';
import { RateService } from './core/services/rate.service';
import { cloneDeep } from 'lodash';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { NotesService } from './core/services/notes.service';
import { resetProgrammeScientificFilters } from './core/utils/reset-filters.utils';
import { Link } from './core/models/link.interface';
import { AppUrlOpenService } from './core/services/app-url-open.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public dateCongress: DateCongress;
  public dataConfig: DataConfig;
  public appConfig: AppConfig;
  public templateConfig: TemplateConfig;
  public firstload = true;
  public schedule: Schedule[];
  public abstracts: Abstract[];
  public scientificFilters: DataFilter;
  public isBadgeButtonDisplayed = false;
  public isVoucherButtonDisplayed = false;
  public mainSponsor: Picture;

  constructor(
    private mapService: MapService,
    private platform: Platform,
    private translate: TranslateService,
    private storage: Storage,
    private confData: ConferenceDataService,
    private modalController: ModalController,
    private router: Router,
    private myProgramService: MyProgramService,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private state: State<{ strapi: StrapiStateInterface }>,
    private inAppBrowserService: InAppBrowserService,
    private photoViewerService: PhotoViewerService,
    private styleService: StyleService,
    private sqliteDatabaseService: SqliteDatabaseService,
    private rateService: RateService,
    private zone: NgZone,
    private menu: MenuController,
    private initializeAppService: InitializeAppService,
    private notesService: NotesService,
    private appUrlOpenService: AppUrlOpenService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
      this.dataConfig = strapi.config.dataConfig;
      this.dateCongress = strapi.config.dateCongress;
      this.templateConfig = strapi.config.templateConfig;
      this.schedule = strapi.programme.schedule.scientific;
      this.abstracts = strapi.abstracts.content;
      this.scientificFilters = cloneDeep(strapi.programme.filters.scientific);
      this.getMainSponsor();
    });

    this.initializeApp();
  }

  ngOnInit() {
    this.platform.resume.subscribe(async () => {
      await this.fetchDataFromStrapi();
      this.styleService.init();
      this.appUrlOpenService.useUrl();
    });
  }

  async openModal() {
    this.photoViewerService.show(
      'https://ressources-smartphone.europa-group.com/2022/' + this.dataConfig.congressNameWithoutSpace + '/plan_general.jpg',
      this.translate.instant('global.map')
    );
  }

  public clickMenuLink(link: Link): void {
    if (link.click?.method) {
      switch (link.click.method) {
        case 'openInteractiveMap': {
          this.openInteractiveMap();
          break;
        }
        case 'displayExhibitorsAsList': {
          this.displayExhibitorsAsList();
          break;
        }
        case 'openModalInteractiviteList': {
          this.openModalInteractiviteList();
          break;
        }
        case 'openModalRegistration': {
          this.openModalRegistration();
          break;
        }
        case 'displayExhibitorsAsMap': {
          this.displayExhibitorsAsMap();
          break;
        }
        case 'goToPcrGotTalentDetail': {
          this.goToPcrGotTalentDetail();
          break;
        }
      }
    }
  }

  async openModalRegistration() {
    this.inAppBrowserService.openUrl(this.appConfig.registrationUrl);
  }

  public openUrl(url?: string): void {
    if (url) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  public openInteractiveMap(): void {
    this.mapService.view.next('PLAN');
    this.router.navigateByUrl('/app/tabs/exposants');
  }

  public displayExhibitorsAsList(): void {
    this.mapService.view.next('LIST');
    setTimeout(() => {
      this.router.navigateByUrl('/app/tabs/exposants');
    });
  }

  public displayExhibitorsAsMap(): void {
    this.mapService.view.next('PLAN');
    setTimeout(() => {
      this.router.navigateByUrl('/app/tabs/exposants');
    });
  }

  async openModalInteractiviteList() {
    const modalIL = await this.modalController.create({
      component: InteractiviteListModal,
      componentProps: {},
      cssClass: 'modal-wrapper',
    });

    return await modalIL.present();
  }

  async initializeSetStorage(name: string, dataStorage: unknown, data: unknown): Promise<unknown> {
    if (data !== undefined && JSON.stringify(data) !== '[]' && JSON.stringify(data) !== '{}') {
      await this.sqliteDatabaseService.set(name, data);
      return data;
    } else {
      return await this.initializeFromStorage(name, dataStorage);
    }
  }

  async initializeFromStorage(name: string, data: unknown): Promise<unknown> {
    const dataStorage = await this.sqliteDatabaseService.get(name);

    if (!dataStorage) {
      await this.sqliteDatabaseService.set(name, data);
      return data;
    } else {
      return dataStorage;
    }
  }

  async clear(): Promise<void> {
    console.log('clear: ', 'clear');
    const keys = await this.storage.keys();
    for (const key of keys) {
      if (key !== 'cgu_accepted' && key !== 'cgu_sharedDataAccepted') {
        await this.storage.remove(key);
      }
    }
    await this.notesService.clearNotesInStorage();
    await this.sqliteDatabaseService.clear();
    if (this.appConfig.loginRequired) {
      this.router.navigate(['/login']);
    }
  }

  async clearDatabaseByVersion(dataStorage: StrapiStateInterface): Promise<void> {
    const strapiVersionStorage = await this.storage.get('strapiVersion');

    if (strapiVersionStorage && dataStorage.config?.appConfig?.strapiVersion) {
      if (strapiVersionStorage !== dataStorage.config.appConfig.strapiVersion) {
        await this.clear();
      }
    } else {
      // this.clear();
    }

    this.storage.set('strapiVersion', dataStorage.config.appConfig.strapiVersion);
  }

  async fetchDataFromStrapi() {
    const strapi: StrapiStateInterface = cloneDeep({
      ...initialState,
      splashIsLoading: false,
    });
    const stateValue = this.state.getValue() as { strapi: StrapiStateInterface };

    let gettingStuff = true;
    this.confData.loadLocalStrapi().subscribe(async (dataStorage: StrapiStateInterface) => {
      await this.clearDatabaseByVersion(dataStorage);
      const subscriptionStrapiRequest = this.confData.loadStrapi(environment.jsonStrapi).subscribe(
        (data: StrapiStateInterface) => {
          gettingStuff = false;
          this.getDataFromStrapi(strapi, data, dataStorage, stateValue);
        },
        () => {
          gettingStuff = false;
          this.getDataFromStorage(strapi, dataStorage, stateValue);
        }
      );
      setTimeout(() => {
        if (gettingStuff) {
          subscriptionStrapiRequest.unsubscribe();
          this.getDataFromStorage(strapi, dataStorage, stateValue);
        }
      }, 10 * 1000); // cancel request after 10 secs
    });
  }

  async getDataFromStrapi(
    strapi: StrapiStateInterface,
    data: StrapiStateInterface,
    dataStorage: StrapiStateInterface,
    stateValue: { strapi: StrapiStateInterface }
  ) {
    strapi.config.appConfig = (await this.initializeSetStorage(
      'configAppConfig',
      dataStorage.config?.appConfig,
      data.config?.appConfig
    )) as StrapiStateInterface['config']['appConfig'];
    strapi.config.dataConfig = (await this.initializeSetStorage(
      'configDataConfig',
      dataStorage.config?.dataConfig,
      data.config?.dataConfig
    )) as StrapiStateInterface['config']['dataConfig'];
    strapi.config.dateCongress = (await this.initializeSetStorage(
      'configDateCongress',
      dataStorage.config?.dateCongress,
      data.config?.dateCongress
    )) as StrapiStateInterface['config']['dateCongress'];
    strapi.config.templateConfig = (await this.initializeSetStorage(
      'configTemplateConfig',
      dataStorage.config?.templateConfig,
      data.config?.templateConfig
    )) as StrapiStateInterface['config']['templateConfig'];

    strapi.programme.speakers = (await this.initializeSetStorage(
      'programmeSpeakers',
      dataStorage.programme?.speakers,
      data.programme?.speakers
    )) as StrapiStateInterface['programme']['speakers'];
    strapi.programme.schedule.scientific = (await this.initializeSetStorage(
      'programmeScheduleScientific',
      dataStorage.programme?.schedule?.scientific,
      data.programme?.schedule?.scientific
    )) as StrapiStateInterface['programme']['schedule']['scientific'];
    strapi.programme.filters.scientific = (await this.initializeSetStorage(
      'programmeFiltersScientific',
      dataStorage.programme?.filters?.scientific,
      data.programme?.filters?.scientific
    )) as StrapiStateInterface['programme']['filters']['scientific'];
    this.mergeFilter(strapi.programme.filters.scientific, stateValue.strapi.programme.filters.scientific);
    strapi.programme.schedule.training = (await this.initializeSetStorage(
      'programmeScheduleTraining',
      dataStorage.programme?.schedule?.training,
      data.programme?.schedule?.training
    )) as StrapiStateInterface['programme']['schedule']['training'];
    strapi.programme.filters.training = (await this.initializeSetStorage(
      'programmeFiltersTraining',
      dataStorage.programme?.filters?.training,
      data.programme?.filters?.training
    )) as StrapiStateInterface['programme']['filters']['training'];
    this.mergeFilter(strapi.programme.filters.training, stateValue.strapi.programme.filters.training);
    strapi.programme.schedule.vod = (await this.initializeSetStorage(
      'programmeScheduleVod',
      dataStorage.programme?.schedule?.vod,
      data.programme?.schedule?.vod
    )) as StrapiStateInterface['programme']['schedule']['vod'];
    strapi.programme.filters.vod = (await this.initializeSetStorage(
      'programmeFiltersVod',
      dataStorage.programme?.filters?.vod,
      data.programme?.filters?.vod
    )) as StrapiStateInterface['programme']['filters']['vod'];
    this.mergeFilter(strapi.programme.filters.vod, stateValue.strapi.programme.filters.vod);
    strapi.programme.schedule.subCongress = (await this.initializeSetStorage(
      'programmeScheduleSubCongress',
      dataStorage.programme?.schedule?.subCongress,
      data.programme?.schedule?.subCongress
    )) as StrapiStateInterface['programme']['schedule']['subCongress'];

    strapi.exhibitors.content = (await this.initializeSetStorage(
      'exhibitorsContent',
      dataStorage.exhibitors?.content,
      data.exhibitors?.content
    )) as StrapiStateInterface['exhibitors']['content'];
    strapi.exhibitors.products = (await this.initializeSetStorage(
      'exhibitorsProducts',
      dataStorage.exhibitors?.products,
      data.exhibitors?.products
    )) as StrapiStateInterface['exhibitors']['products'];
    strapi.exhibitors.filters = (await this.initializeSetStorage(
      'exhibitorsFilters',
      dataStorage.exhibitors?.filters,
      data.exhibitors?.filters
    )) as StrapiStateInterface['exhibitors']['filters'];

    strapi.abstracts.content = (await this.initializeSetStorage(
      'abstractsContent',
      dataStorage.abstracts?.content,
      data.abstracts?.content
    )) as StrapiStateInterface['abstracts']['content'];
    strapi.abstracts.filters = (await this.initializeSetStorage(
      'abstractsFilters',
      dataStorage.abstracts?.filters,
      data.abstracts?.filters
    )) as StrapiStateInterface['abstracts']['filters'];
    this.mergeFilter(strapi.abstracts.filters, stateValue.strapi.abstracts.filters);

    strapi.exhibitors.interactiveMap = (await this.initializeSetStorage(
      'interactiveMap',
      dataStorage.exhibitors.interactiveMap,
      data.exhibitors.interactiveMap
    )) as StrapiStateInterface['exhibitors']['interactiveMap'];
    strapi.exhibitors.interactiveMapAssociations = (await this.initializeSetStorage(
      'interactiveMapAssociations',
      dataStorage.exhibitors.interactiveMapAssociations,
      data.exhibitors.interactiveMapAssociations
    )) as StrapiStateInterface['exhibitors']['interactiveMapAssociations'];

    strapi.generalInformation.about = (await this.initializeSetStorage(
      'generalInformation',
      dataStorage.generalInformation?.about,
      data.generalInformation?.about
    )) as StrapiStateInterface['generalInformation']['about'];
    strapi.generalInformation.certificateAttendance = (await this.initializeSetStorage(
      'certificateAttendance',
      dataStorage.generalInformation?.certificateAttendance,
      data.generalInformation?.certificateAttendance
    )) as StrapiStateInterface['generalInformation']['certificateAttendance'];
    strapi.generalInformation.neuralQuizz = (await this.initializeSetStorage(
      'neuralQuizz',
      dataStorage.generalInformation?.neuralQuizz,
      data.generalInformation?.neuralQuizz
    )) as StrapiStateInterface['generalInformation']['neuralQuizz'];
    strapi.generalInformation.replay = (await this.initializeSetStorage(
      'replay',
      dataStorage.generalInformation?.replay,
      data.generalInformation?.replay
    )) as StrapiStateInterface['generalInformation']['replay'];
    strapi.generalInformation.jobs = (await this.initializeSetStorage(
      'jobs',
      dataStorage.generalInformation?.jobs,
      data.generalInformation?.jobs
    )) as StrapiStateInterface['generalInformation']['jobs'];
    strapi.generalInformation.inscription = (await this.initializeSetStorage(
      'inscription',
      dataStorage.generalInformation?.inscription,
      data.generalInformation?.inscription
    )) as StrapiStateInterface['generalInformation']['inscription'];
    strapi.generalInformation.cgu = (await this.initializeSetStorage(
      'cgu',
      dataStorage.generalInformation?.cgu,
      data.generalInformation?.cgu
    )) as StrapiStateInterface['generalInformation']['cgu'];
    strapi.generalInformation.customPages = (await this.initializeSetStorage(
      'customPages',
      dataStorage.generalInformation?.customPages,
      data.generalInformation?.customPages
    )) as StrapiStateInterface['generalInformation']['customPages'];

    this.store.dispatch(setStrapi({ strapi }));

    await this.storage.set('lastSave', new Date().getTime());
  }

  async getDataFromStorage(strapi: StrapiStateInterface, dataStorage: StrapiStateInterface, stateValue: { strapi: StrapiStateInterface }) {
    strapi.config.appConfig = (await this.initializeFromStorage(
      'configAppConfig',
      dataStorage.config?.appConfig
    )) as StrapiStateInterface['config']['appConfig'];
    strapi.config.dataConfig = (await this.initializeFromStorage(
      'configDataConfig',
      dataStorage.config?.dataConfig
    )) as StrapiStateInterface['config']['dataConfig'];
    strapi.config.dateCongress = (await this.initializeFromStorage(
      'configDateCongress',
      dataStorage.config?.dateCongress
    )) as StrapiStateInterface['config']['dateCongress'];
    strapi.config.templateConfig = (await this.initializeFromStorage(
      'configTemplateConfig',
      dataStorage.config?.templateConfig
    )) as StrapiStateInterface['config']['templateConfig'];

    strapi.programme.speakers = (await this.initializeFromStorage(
      'programmeSpeakers',
      dataStorage.programme?.speakers
    )) as StrapiStateInterface['programme']['speakers'];
    strapi.programme.schedule.scientific = (await this.initializeFromStorage(
      'programmeScheduleScientific',
      dataStorage.programme?.schedule?.scientific
    )) as StrapiStateInterface['programme']['schedule']['scientific'];
    strapi.programme.filters.scientific = (await this.initializeFromStorage(
      'programmeFiltersScientific',
      dataStorage.programme?.filters?.scientific
    )) as StrapiStateInterface['programme']['filters']['scientific'];
    this.mergeFilter(strapi.programme.filters.scientific, stateValue.strapi.programme.filters.scientific);
    strapi.programme.schedule.training = (await this.initializeFromStorage(
      'programmeScheduleTraining',
      dataStorage.programme?.schedule?.training
    )) as StrapiStateInterface['programme']['schedule']['training'];
    strapi.programme.filters.training = (await this.initializeFromStorage(
      'programmeFiltersTraining',
      dataStorage.programme?.filters?.training
    )) as StrapiStateInterface['programme']['filters']['training'];
    this.mergeFilter(strapi.programme.filters.training, stateValue.strapi.programme.filters.training);
    strapi.programme.schedule.vod = (await this.initializeFromStorage(
      'programmeScheduleVod',
      dataStorage.programme?.schedule?.vod
    )) as StrapiStateInterface['programme']['schedule']['vod'];
    strapi.programme.filters.vod = (await this.initializeFromStorage(
      'programmeFiltersVod',
      dataStorage.programme?.filters?.vod
    )) as StrapiStateInterface['programme']['filters']['vod'];
    this.mergeFilter(strapi.programme.filters.vod, stateValue.strapi.programme.filters.vod);
    strapi.programme.schedule.subCongress = (await this.initializeFromStorage(
      'programmeScheduleSubCongress',
      dataStorage.programme?.schedule?.subCongress
    )) as StrapiStateInterface['programme']['schedule']['subCongress'];

    strapi.exhibitors.content = (await this.initializeFromStorage(
      'exhibitorsContent',
      dataStorage.exhibitors?.content
    )) as StrapiStateInterface['exhibitors']['content'];
    strapi.exhibitors.products = (await this.initializeFromStorage(
      'exhibitorsProducts',
      dataStorage.exhibitors?.products
    )) as StrapiStateInterface['exhibitors']['products'];
    strapi.exhibitors.filters = (await this.initializeFromStorage(
      'exhibitorsFilters',
      dataStorage.exhibitors?.filters
    )) as StrapiStateInterface['exhibitors']['filters'];

    strapi.abstracts.content = (await this.initializeFromStorage(
      'abstractsContent',
      dataStorage.abstracts?.content
    )) as StrapiStateInterface['abstracts']['content'];
    strapi.abstracts.filters = (await this.initializeFromStorage(
      'abstractsFilters',
      dataStorage.abstracts?.filters
    )) as StrapiStateInterface['abstracts']['filters'];
    this.mergeFilter(strapi.abstracts.filters, stateValue.strapi.abstracts.filters);

    strapi.exhibitors.interactiveMap = (await this.initializeFromStorage(
      'interactiveMap',
      dataStorage.exhibitors.interactiveMap
    )) as StrapiStateInterface['exhibitors']['interactiveMap'];
    strapi.exhibitors.interactiveMapAssociations = (await this.initializeFromStorage(
      'interactiveMapAssociations',
      dataStorage.exhibitors.interactiveMapAssociations
    )) as StrapiStateInterface['exhibitors']['interactiveMapAssociations'];

    strapi.generalInformation.about = (await this.initializeFromStorage(
      'generalInformation',
      dataStorage.generalInformation?.about
    )) as StrapiStateInterface['generalInformation']['about'];
    strapi.generalInformation.certificateAttendance = (await this.initializeFromStorage(
      'certificateAttendance',
      dataStorage.generalInformation?.certificateAttendance
    )) as StrapiStateInterface['generalInformation']['certificateAttendance'];
    strapi.generalInformation.neuralQuizz = (await this.initializeFromStorage(
      'neuralQuizz',
      dataStorage.generalInformation?.neuralQuizz
    )) as StrapiStateInterface['generalInformation']['neuralQuizz'];
    strapi.generalInformation.replay = (await this.initializeFromStorage(
      'replay',
      dataStorage.generalInformation?.replay
    )) as StrapiStateInterface['generalInformation']['replay'];
    strapi.generalInformation.jobs = (await this.initializeFromStorage(
      'jobs',
      dataStorage.generalInformation?.jobs
    )) as StrapiStateInterface['generalInformation']['jobs'];
    strapi.generalInformation.inscription = (await this.initializeFromStorage(
      'inscription',
      dataStorage.generalInformation?.inscription
    )) as StrapiStateInterface['generalInformation']['inscription'];
    strapi.generalInformation.cgu = (await this.initializeFromStorage(
      'cgu',
      dataStorage.generalInformation?.cgu
    )) as StrapiStateInterface['generalInformation']['cgu'];
    strapi.generalInformation.customPages = (await this.initializeFromStorage(
      'customPages',
      dataStorage.generalInformation?.customPages
    )) as StrapiStateInterface['generalInformation']['customPages'];

    this.store.dispatch(setStrapi({ strapi }));
  }

  mergeFilter(filtersFromStorage: DataFilter, filtersInProcess: DataFilter) {
    for (const filter in filtersFromStorage) {
      if (filter && filtersInProcess[filter]) {
        for (const value of filtersFromStorage[filter]) {
          const valueInProcess = filtersInProcess[filter].find((f) => f.val === value.val);
          if (valueInProcess) {
            value.isChecked = valueInProcess.isChecked;
          }
        }
      }
    }
  }

  async initializeApp() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(async () => {
        try {
          await this.platform.ready();
          const slug = event.url.split('app.pcronline.com/').pop();
          if (slug) {
            this.appUrlOpenService.setUrlOpen('/' + slug);
          }
        } catch (error) {
          console.log('🚀 ~ file: app.component.ts:624 ~ AppComponent ~ this.zone.run ~ error:', error);
        }
      });
    });

    await this.platform.ready().then(async () => {
      try {
        this.translate.use(this.dataConfig.language ?? 'fr');
      } catch (error) {
        console.log(error);
      }
      try {
        await this.storage.create();
      } catch (error) {
        console.log(error);
      }
      try {
        await this.initializeAppService.waitAppInit();
        await this.fetchDataFromStrapi();
      } catch (error) {
        console.log(error);
      }

      try {
        await this.myProgramService.init();
        await this.rateService.init();
        await this.styleService.init();
      } catch (error) {
        console.log(error);
      }
    });
  }

  goToDetail(keyRoom: string) {
    this.router.navigate(['/app/tabs/interactivite-detail/' + keyRoom]);
  }

  goToPcrGotTalentDetail() {
    this.router.navigate(['/app/tabs/pcr-got-talent']);
  }

  getMainSponsor(): void {
    const actualDay: Date = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const dateToString = `${actualDay.getFullYear()}-${(actualDay.getMonth() + 1 + '').padStart(2, '0')}-${(
      actualDay.getDate() + ''
    ).padStart(2, '0')}`;
    const picture = this.templateConfig?.pictures?.find((pic) => pic.date === dateToString);

    this.mainSponsor = picture
      ? picture.mainSponsor
      : this.templateConfig.pictures?.[0].date >= dateToString
      ? this.templateConfig.pictures?.[0].mainSponsor
      : this.templateConfig.pictures?.[this.templateConfig.pictures.length - 1].mainSponsor;
  }

  public clickAdMainSponsor(): void {
    if (this.mainSponsor.link) {
      this.inAppBrowserService.openUrl(this.mainSponsor.link);
    }
  }

  public async goToSurvey(): Promise<void> {
    if (this.dataConfig?.socialnetworks?.survey) {
      this.inAppBrowserService.openUrl(this.dataConfig.socialnetworks.survey);
    }
  }

  public closeMenu(): void {
    this.menu.close();
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
}
