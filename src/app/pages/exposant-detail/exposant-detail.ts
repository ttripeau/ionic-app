import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { Exhibitor } from 'src/app/core/models/exhibitor.interface';
import { AppConfig, DataConfig, DateCongress, Filter, TemplateConfig } from 'src/app/core/models/config.interface';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { resetProgrammeScientificFilters } from 'src/app/core/utils/reset-filters.utils';
import { setProgrammeFiltersScientific, setProgrammeFiltersTraining } from 'src/app/core/store/actions/strapi.actions';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';
import { PhotoViewerService } from 'src/app/core/services/photo-viewer.service';
import { NotesService } from 'src/app/core/services/notes.service';
import { ModalController } from '@ionic/angular';
import { AddNoteModal } from 'src/app/shared/modals/add-note/add-note.modal';
import { Note } from 'src/app/core/models/note.interface';
import { ContactDetailComponentInterface } from 'src/app/shared/components/contact-detail/contact-detail.component';
import { MapService } from 'src/app/core/services/map.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-page-exposant-detail',
  templateUrl: 'exposant-detail.html',
  styleUrls: ['./exposant-detail.scss'],
})
export class ExposantDetailPage {
  public exposant: Exhibitor;
  public defaultHref: string = '';
  public dateCongress: DateCongress;
  public appConfig: AppConfig;
  public dataConfig: DataConfig;
  public templateConfig: TemplateConfig;
  public schedule: Schedule[];
  public scheduleTraining: Schedule[];
  public scheduleScientificFilters: { [key: string]: Filter[] };
  public scheduleTrainingFilters: { [key: string]: Filter[] };
  public strapi: StrapiStateInterface;
  public note: Note | null = null;
  public coordinates: ContactDetailComponentInterface[] = [];
  public contact: ContactDetailComponentInterface[] = [];
  public symposiaScientific: {
    [key: string]: {
      date: string;
      groups: {
        [key: string]: {
          time: string;
          sessions: Session[];
        };
      };
    };
  };
  public symposiaTraining: {
    [key: string]: {
      date: string;
      groups: {
        [key: string]: {
          time: string;
          sessions: Session[];
        };
      };
    };
  };

  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private location: Location,
    private modalController: ModalController,
    private notesService: NotesService,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private router: Router,
    private inAppBrowserService: InAppBrowserService,
    private photoViewerService: PhotoViewerService,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.strapi = strapi;
      this.dataConfig = strapi.config.dataConfig;
      this.appConfig = strapi.config.appConfig;
      this.dateCongress = strapi.config.dateCongress;
      this.templateConfig = strapi.config.templateConfig;
      this.schedule = strapi.programme.schedule.scientific;
      this.scheduleTraining = strapi.programme.schedule.training;
      this.scheduleScientificFilters = cloneDeep(strapi.programme.filters.scientific);
      this.scheduleTrainingFilters = cloneDeep(strapi.programme.filters.training);
      this.findExposant(strapi.exhibitors.content);
    });
  }

  public ionViewWillEnter(): void {
    this.defaultHref = this.route.snapshot.queryParamMap.get('routeBack') ?? '';
  }

  public async findExposant(exposants: Exhibitor[]): Promise<void> {
    const exposantId = this.route.snapshot.paramMap.get('exposantId');

    for (const exposant of exposants) {
      if (exposant && exposantId && exposant.id === parseInt(exposantId, 10)) {
        this.exposant = cloneDeep(exposant);
        this.note = await this.notesService.getNote(`${this.exposant.id}`, 'exhibitors');
        if (this.note?.value) {
          this.note.value = this.note.value.replace(/\n/g, '<br>');
        }
        break;
      }
    }

    if (this.exposant?.presentation) {
      this.exposant.presentation = this.exposant?.presentation?.replace(/\n/g, '<br>');
    }
    if (this.exposant?.productsDescription) {
      this.exposant.productsDescription = this.exposant?.productsDescription?.replace(/\n/g, '<br>');
    }

    this.coordinates = this.getCoordinatesDetails();
    this.contact = this.getContactDetails();

    // this.buildSymposiaScientific();
    // this.buildSymposiaTraining();
  }

  public openInteractiveMap(): void {
    this.mapService.polygonId.next(this.exposant.id);
    this.mapService.view.next('PLAN');
    this.router.navigate(['/app/tabs/exposants']);
  }

  public showSessions(): void {
    resetProgrammeScientificFilters(this.scheduleScientificFilters);
    this.scheduleScientificFilters.sponsors.forEach((e) => {
      e.isChecked = parseInt(e.id + '', 10) === parseInt(this.exposant.idSponsor + '', 10);
    });

    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.scheduleScientificFilters }));

    this.router.navigate(['/app/tabs/programme'], {
      queryParams: {
        routeBack: '/app/tabs/exposants/exposant-details/' + this.exposant.id,
      },
    });
  }

  public showTrainingSessions(): void {
    resetProgrammeScientificFilters(this.scheduleTrainingFilters);
    this.scheduleTrainingFilters.sponsors.forEach((e) => {
      e.isChecked = parseInt(e.id + '', 10) === parseInt(this.exposant.idSponsorTraining + '', 10);
    });

    this.store.dispatch(setProgrammeFiltersTraining({ filters: this.scheduleTrainingFilters }));

    this.router.navigate(['/app/tabs/programme/training'], {
      queryParams: {
        routeBack: '/app/tabs/exposants/exposant-details/' + this.exposant.id,
      },
    });
  }

  public buildSymposiaScientific(): void {
    let sessionList: Session[] = [];
    if (this.exposant?.idSessions) {
      sessionList = JSON.parse(this.exposant?.idSessions) ?? [];
    }

    sessionList.sort(
      (a, b) =>
        new Date(parseInt(a.timeBeginTimeStamp, 10) * 1000).getTime() - new Date(parseInt(b.timeBeginTimeStamp, 10) * 1000).getTime()
    );

    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const sessionListFiltered = sessionList?.filter((s) => new Date(parseInt(s.timeEndTimestamp, 10) * 1000) >= actualDate);

    if (sessionListFiltered.length < 3) {
      sessionList = sessionList.slice(-3);
    } else {
      sessionList = sessionListFiltered.slice(0, 3);
    }

    this.symposiaScientific = {};

    if (this.exposant && this.schedule) {
      this.schedule.forEach((value, index) => {
        value.groups.forEach((group, groupIndex) => {
          group.sessions.forEach((session) => {
            if (sessionList.find((s) => s.idSession === session.idSession)) {
              if (!this.symposiaScientific[index]) {
                this.symposiaScientific[index] = {
                  date: value.date,
                  groups: {},
                };
              }
              if (!this.symposiaScientific[index].groups[groupIndex]) {
                this.symposiaScientific[index].groups[groupIndex] = {
                  time: group.time,
                  sessions: [],
                };
              }
              this.symposiaScientific[index].groups[groupIndex].sessions.push({
                ...session,
                sponsors: [],
              });
            }
          });
        });
      });
    }
  }

  public buildSymposiaTraining(): void {
    let sessionList: Session[] = [];
    if (this.exposant?.idSessions) {
      sessionList = JSON.parse(this.exposant?.idSessions) ?? [];
    }

    sessionList.sort(
      (a, b) =>
        new Date(parseInt(a.timeBeginTimeStamp, 10) * 1000).getTime() - new Date(parseInt(b.timeBeginTimeStamp, 10) * 1000).getTime()
    );

    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const sessionListFiltered = sessionList?.filter((s) => new Date(parseInt(s.timeEndTimestamp, 10) * 1000) >= actualDate);

    if (sessionListFiltered.length < 3) {
      sessionList = sessionList.slice(-3);
    } else {
      sessionList = sessionListFiltered.slice(0, 3);
    }

    this.symposiaTraining = {};

    if (this.exposant && this.scheduleTraining) {
      this.scheduleTraining.forEach((value, index) => {
        value.groups.forEach((group, groupIndex) => {
          group.sessions.forEach((session) => {
            if (sessionList.find((s) => s.idSession === session.idSession)) {
              if (!this.symposiaTraining[index]) {
                this.symposiaTraining[index] = {
                  date: value.date,
                  groups: {},
                };
              }
              if (!this.symposiaTraining[index].groups[groupIndex]) {
                this.symposiaTraining[index].groups[groupIndex] = {
                  time: group.time,
                  sessions: [],
                };
              }
              this.symposiaTraining[index].groups[groupIndex].sessions.push({
                ...session,
                sponsors: [],
              });
            }
          });
        });
      });
    }
  }

  public async openModal(): Promise<void> {
    this.photoViewerService.show(
      'https://ressources-smartphone.europa-group.com/2022/' + this.dataConfig.congressNameWithoutSpace + '/plan.jpg',
      this.translate.instant('global.map')
    );
  }

  public openUrl(urlLink?: string | null): void {
    if (urlLink) {
      this.inAppBrowserService.openUrl(urlLink);
    }
  }

  public myBackButton(): void {
    this.location.back();
  }

  // public getCoordinatesDetails(): { show: string; icon: string; color: string; detail: string; textColor?: string }[] {
  //   return [
  //     {
  //       show: this.exposant?.societe,
  //       icon: 'star-outline',
  //       color: 'congressultralight',
  //       detail: `<h2><b>${this.exposant.societe}</b></h2>`,
  //       textColor: 'congress',
  //     },
  //     {
  //       show: this.exposant?.address?.trim(),
  //       icon: 'navigate-outline',
  //       color: 'congressultralight',
  //       detail: this.exposant.address,
  //     },
  //     {
  //       show: this.exposant?.webSite,
  //       icon: 'link-outline',
  //       color: 'congressultralight',
  //       detail: `<a href="${this.exposant.webSite}">${this.exposant.webSite}</a>`,
  //     },
  //     {
  //       show: this.exposant?.emailContact,
  //       icon: 'mail-outline',
  //       color: 'congressultralight',
  //       detail: `<a href="mailto:${this.exposant.emailContact}">${this.exposant.emailContact}</a>`,
  //     },
  //     {
  //       show: this.exposant?.telephone,
  //       icon: 'call-outline',
  //       color: 'congressultralight',
  //       detail: `<a href="tel:${this.exposant.telephone}">${this.exposant.telephone}</a>`,
  //     },
  //   ];
  // }

  public getContactDetails(): ContactDetailComponentInterface[] {
    return [
      {
        show: this.exposant?.lastnameFirstname,
        icon: 'person-circle-outline',
        color: 'congressultralight',
        detail: `<h2><b>${this.exposant?.lastnameFirstname}</b></h2>`,
        textColor: 'congress',
      },
      {
        show: this.exposant?.contactMail,
        icon: 'mail-outline',
        color: 'congressultralight',
        detail: `<a href="mailto:${this.exposant?.contactMail}">${this.exposant?.contactMail}</a>`,
      },
      {
        show: this.exposant?.contactPhone,
        icon: 'call-outline',
        color: 'congressultralight',
        detail: `<a href="tel:${this.exposant?.contactPhone}">${this.exposant?.contactPhone}</a>`,
      },
    ];
  }

  public getCoordinatesDetails(): ContactDetailComponentInterface[] {
    return [
      {
        show: this.exposant?.companyMail,
        icon: 'mail-outline',
        color: 'congress',
        // textColor: 'light',
        detail: `<a class="contact-dark" href="mailto:${this.exposant?.companyMail}">${this.exposant?.companyMail}</a>`,
      },
      {
        show: this.exposant?.contactPhone,
        icon: 'call-outline',
        color: 'congress',
        // textColor: 'light',
        detail: `<a class="contact-dark" href="tel:${this.exposant?.contactPhone}">${this.exposant?.contactPhone}</a>`,
      },
      {
        show: this.isSamePhone(this.exposant?.contactPhone, this.exposant?.phone) ? '' : this.exposant?.phone,
        icon: 'call-outline',
        color: 'congress',
        // textColor: 'light',
        detail: `<a class="contact-dark" href="tel:${this.exposant?.phone}">${this.exposant?.phone}</a>`,
      },
      {
        show: this.exposant?.address?.trim(),
        icon: 'navigate-outline',
        color: 'congress',
        // textColor: 'light',
        detail: this.exposant?.address,
      },
      {
        show: this.exposant?.webSite,
        icon: 'link-outline',
        color: 'congress',
        // textColor: 'light',
        detail: `<a class="contact-dark" href="${this.exposant?.webSite}">${this.exposant?.webSite}</a>`,
      },
      {
        show: this.exposant?.Linkedin,
        icon: 'logo-linkedIn',
        color: 'linkedin',
        // textColor: 'light',
        detail: `<a class="contact-dark no-underline no-underline" href="${this.exposant?.Linkedin}">LinkedIn</a>`,
      },
      {
        show: this.exposant?.Twitter,
        icon: 'logo-twitter',
        color: 'twitter',
        // textColor: 'light',
        detail: `<a class="contact-dark no-underline" href="${this.exposant?.Twitter}">Twitter</a>`,
      },
      {
        show: this.exposant?.Instagram,
        icon: 'logo-instagram',
        color: 'instagram',
        // textColor: 'light',
        detail: `<a class="contact-dark no-underline" href="${this.exposant?.Instagram}">Instagram</a>`,
      },
      {
        show: this.exposant?.Facebook,
        icon: 'logo-facebook',
        color: 'facebook',
        // textColor: 'light',
        detail: `<a class="contact-dark no-underline" href="${this.exposant?.Facebook}">Facebook</a>`,
      },
      {
        show: this.exposant?.Youtube,
        icon: 'logo-youtube',
        color: 'youtube',
        // textColor: 'light',
        detail: `<a class="contact-dark no-underline" href="${this.exposant?.Youtube}">Youtube</a>`,
      },
    ].filter((x) => x.show);
  }

  public async addNote(): Promise<void> {
    const noteAlreadyExist = this.note !== null;

    const modal = await this.modalController.create({
      component: AddNoteModal,
      componentProps: {
        data: {
          value: noteAlreadyExist && this.note ? this.note.value : '',
          html: noteAlreadyExist && this.note ? this.note.html : '',
        },
        isNew: !noteAlreadyExist,
      },
    });

    modal.onDidDismiss().then(async (response: any) => {
      if (response.data) {
        response.data.value = response.data.value?.replace(/\n/g, '<br>');
        if (noteAlreadyExist && response.data.length > 0) {
          if (this.note) {
            this.note.value = response.data.value;
            this.note.html = response.data.html;
            this.notesService.addOrEditNote(this.note, 'exhibitors');
          }
        } else if (noteAlreadyExist && response.data.value.length === 0) {
          if (this.note) {
            await this.notesService.deleteNote(this.note, 'exhibitors');
            this.note = null;
          }
        } else {
          if (response.data.value !== '') {
            this.note = {
              storageKey: `notes_exhibitors_${this.exposant.id}`,
              refId: `${this.exposant.id}`,
              refTitle: this.exposant.name ?? '',
              value: response.data.value,
              html: response.data.html,
              updatedAt: new Date().getTime(),
            };

            this.notesService.addOrEditNote(this.note, 'exhibitors');
          }
        }
      }
    });

    return await modal.present();
  }

  public clickContactUs(mailContact?: string | null): void {
    if (mailContact) {
      window.open(`mailto:${mailContact}`, '_blank')?.focus();
    }
  }

  private isSamePhone(phoneOne: string | null, phoneTwo: string | null): boolean {
    let result = false;

    if (phoneOne === phoneTwo) {
      result = true;
    } else {
      phoneOne = phoneOne ? phoneOne?.trim() : null;
      phoneTwo = phoneTwo ? phoneTwo?.trim() : null;

      if (phoneOne && phoneTwo && phoneOne.slice(-9) === phoneTwo.slice(-9)) {
        result = true;
      }
    }

    return result;
  }
}
