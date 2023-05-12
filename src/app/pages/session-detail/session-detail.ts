import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyProgramService } from 'src/app/core/services/my-program.service';
import { State, Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { AppConfig, DateCongress, TemplateConfig } from 'src/app/core/models/config.interface';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { FavoriteSessionInterface } from 'src/app/core/store/reducers/my-program.reducer';
import { ModalController } from '@ionic/angular';
import { AddNoteModal } from 'src/app/shared/modals/add-note/add-note.modal';
import { Note } from 'src/app/core/models/note.interface';
import { NotesService } from 'src/app/core/services/notes.service';
import { ContactDetailComponentInterface } from 'src/app/shared/components/contact-detail/contact-detail.component';
import { Sponsor } from 'src/app/core/models/sponsor.interface';
import { PersonalProgrammeService } from 'src/app/core/services/personal-programme.service';
import { TranslateService } from '@ngx-translate/core';
import { Speaker } from 'src/app/core/models/speaker.interface';
import { RateService } from 'src/app/core/services/rate.service';
import { cloneDeep } from 'lodash';
import { MapService } from 'src/app/core/services/map.service';
import { InAppBrowserService } from 'src/app/core/services/in-app-browser.service';

@Component({
  selector: 'app-page-session-detail',
  styleUrls: ['./session-detail.scss'],
  templateUrl: 'session-detail.html',
})
export class SessionDetailPage {
  public session: Session;
  public defaultHref = '';
  public dateCongress: DateCongress;
  public templateConfig: TemplateConfig;
  public appConfig: AppConfig;
  public hasInteractivity = false;
  public text: string | undefined;
  public isVod = false;
  public note: Note | null = null;
  public sessionTrainingStorage: Schedule[] = [];
  public scheduleSubCongress: { [subCongress: string]: Schedule[] } = {};
  public scheduleScientificStorage: Schedule[] = [];
  public scheduleVodStorage: Session[] = [];
  public showAddToMyCalendar: boolean = false;
  public rating: number = 0;
  public isTrainingSession: boolean = false;
  public details: ContactDetailComponentInterface[] = [];
  public guestComments: string[] = [];
  public isInteractive: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private myProgramService: MyProgramService,
    private modalController: ModalController,
    private notesService: NotesService,
    private router: Router,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private state: State<{ favoriteSession: FavoriteSessionInterface }>,
    private personalProgrammeService: PersonalProgrammeService,
    private translate: TranslateService,
    private rateService: RateService,
    private mapService: MapService,
    private inAppBrowserService: InAppBrowserService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.dateCongress = strapi.config.dateCongress;
      this.appConfig = strapi.config.appConfig;
      this.templateConfig = strapi.config.templateConfig;
      this.text = strapi.config.appConfig.texts?.vod;
      this.sessionTrainingStorage = strapi.programme.schedule.training;
      this.scheduleScientificStorage = strapi.programme.schedule.scientific;
      this.scheduleSubCongress = strapi.programme.schedule.subCongress;
      this.scheduleVodStorage = strapi.programme.schedule.vod;
      this.getSession();
    });

    this.personalProgrammeService.appearanceProgramme$.subscribe(() => {
      this.getSession();
    });
  }

  public ionViewWillEnter(): void {
    this.defaultHref = this.route.snapshot.queryParamMap.get('routeBack') ?? '';
  }

  public async getSession(): Promise<void> {
    // const prevRoute = this.previousRoute.getPreviousUrl();

    // if(prevRoute){
    //   const regexChat = new RegExp('/app\/tabs\/speakers\/speaker-details\/');
    //    if(regexChat.test(prevRoute)){
    //     this.defaultHref = '';
    //   }else{
    //     this.defaultHref = prevRoute;
    //   }
    // }else{
    //   this.defaultHref = '';
    // }

    const dayId = this.route.snapshot.paramMap.get('dayId') ?? '';
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    let tempSession: Session | undefined;

    const appearanceSession = this.personalProgrammeService.appearanceProgramme$.getValue();
    for (const session of appearanceSession) {
      if (sessionId && session.idSession === parseInt(sessionId, 10) && session.idDate === dayId) {
        tempSession = session;
        this.isTrainingSession = false;
        break;
      }
    }

    if (!tempSession) {
      const sessionStorage = this.scheduleScientificStorage;
      if (dayId && sessionStorage[parseInt(dayId, 10)]) {
        for (const oneGroup of sessionStorage[parseInt(dayId, 10)].groups) {
          for (const oneSession of oneGroup.sessions) {
            if (oneSession && oneSession.idSession === parseInt(sessionId ?? '', 10)) {
              tempSession = oneSession;
              this.isTrainingSession = false;
              break;
            }
          }
        }
      }
    }

    if (!tempSession) {
      if (this.sessionTrainingStorage?.[parseInt(dayId, 10)]) {
        for (const oneGroup of this.sessionTrainingStorage[parseInt(dayId, 10)].groups) {
          for (const oneSession of oneGroup.sessions) {
            if (oneSession && oneSession.idSession === parseInt(sessionId ?? '', 10)) {
              tempSession = oneSession;
              this.isTrainingSession = true;
              break;
            }
          }
        }
      }
    }

    if (!tempSession) {
      for (const subCongress of Object.values(this.scheduleSubCongress ?? {})) {
        for (const day of subCongress) {
          for (const oneGroup of day.groups) {
            for (const oneSession of oneGroup.sessions) {
              if (oneSession && oneSession.idSession === parseInt(sessionId ?? '', 10)) {
                tempSession = oneSession;
                this.isTrainingSession = true;
                break;
              }
            }
          }
        }
      }
    }

    if (!tempSession) {
      if (this.scheduleVodStorage.length > 0) {
        for (const session of this.scheduleVodStorage) {
          if (session && session.idSession === parseInt(sessionId ?? '', 10)) {
            tempSession = session;
            this.isTrainingSession = false;
            break;
          }
        }
      }
    }

    tempSession = cloneDeep(tempSession);

    if (tempSession) {
      const stateValue = await this.state.getValue();
      const dataStorage = stateValue.favoriteSessions?.filter((f: Session) => !!f)
        ? stateValue.favoriteSessions?.filter((f: Session) => !!f)
        : [];
      const favSessionStored = dataStorage && dataStorage.length ? dataStorage : [];

      this.rating = await this.rateService.getRateSession(tempSession.idSession);

      if (favSessionStored && favSessionStored.find((f: Session) => f?.idSession === tempSession?.idSession)) {
        tempSession.isfavorite = true;
      } else {
        tempSession.isfavorite = false;
      }

      if (!this.session?.doIAppear) {
        tempSession.interventions = tempSession.interventions.filter((intervention) => !intervention.hidden);
        tempSession.faculties = tempSession.faculties.filter((faculty) => !faculty.hidden);
      }
      if (this.session?.doIAppear) {
        tempSession.faculties = tempSession.faculties.filter(
          (faculty) => !faculty.hidden || faculty.idSpeaker === this.personalProgrammeService.reference
        );
      }
      tempSession.moderators = tempSession.moderators.filter((moderator) => !moderator.hidden);
      tempSession.speakers = tempSession.speakers.filter((speaker) => !speaker.hidden);

      this.guestComments = [];
      if (tempSession.guestComment) {
        this.guestComments.push(tempSession.guestComment);
      }

      if (tempSession.interventions && this.personalProgrammeService.reference) {
        for (const intervention of tempSession.interventions) {
          const speaker = intervention.speakers.find((s) => s.idSpeaker === this.personalProgrammeService.reference);
          if (speaker && intervention.guestComment) {
            this.guestComments.push(intervention.guestComment);
          }
        }
      }

      this.isInteractive = !!tempSession.tags.find((tag) => tag.title === 'Interactivité');
      this.isVod = tempSession.isVod;
      this.details = this.getDetails(tempSession);
      this.session = tempSession;

      this.note = await this.notesService.getNote(`${tempSession.idSession}`, 'sessions');
      if (this.note?.value) {
        this.note.value = this.note.value.replace(/\n/g, '<br>');
      }
    }

    this.showHasInteractivity();
  }

  public addFavorite(): void {
    this.myProgramService.addFavorite(this.session).then(() => {
      this.session.isfavorite = true;
    });
  }

  public removeFavorite(): void {
    this.myProgramService.removeFavorite(this.session).then(() => {
      this.session.isfavorite = false;
    });
  }

  public displayExhibitor(session: Session): void {
    this.router.navigate([`/app/tabs/exposants/exposant-details/${session.idExhibitor}`], {
      queryParams: {
        routeBack: `/app/tabs/programme/session/${session.idDate}/${session.idSession}`,
      },
    });
  }

  public displaySponsors(sponsors: Sponsor[]): string {
    return sponsors.map((sponsor) => sponsor.title).join(', ');
  }

  public handleClick(link: string): void {
    if (link.includes('room__')) {
      this.mapService.polygonName.next(link.substring(6));
      this.mapService.view.next('PLAN');
      this.router.navigate(['/app/tabs/exposants']);
      return;
    }

    this.router.navigate([link], {
      queryParams: {
        routeBack: '/app/tabs/programme/session/' + this.session.idDate + '/' + this.session.idSession,
      },
    });
  }

  public showHasInteractivity(): void {
    const interactivityRooms = this.dateCongress.interactivityRooms.map((i) => i?.room?.toLowerCase());
    this.hasInteractivity = interactivityRooms.includes(this.session?.room?.toLowerCase());
  }

  public goToInteractivity(): void {
    const room = this.dateCongress.interactivityRooms.find((i) => i?.room?.toLowerCase() === this.session?.room?.toLowerCase());
    this.router.navigate(['/app/tabs/interactivite-detail/' + room?.slidoKey]);
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
            this.notesService.addOrEditNote(this.note, 'sessions');
          }
        } else if (noteAlreadyExist && response.data.value.length === 0) {
          if (this.note) {
            await this.notesService.deleteNote(this.note, 'sessions');
            this.note = null;
          }
        } else {
          if (response.data.value !== '') {
            this.note = {
              storageKey: `notes_sessions_${this.session.idSession}`,
              refId: `${this.session.idSession}`,
              refTitle: this.session.title,
              idDate: this.session.idDate,
              value: response.data.value,
              html: response.data.html,
              updatedAt: new Date().getTime(),
            };

            this.notesService.addOrEditNote(this.note, 'sessions');
          }
        }
      }
    });

    return await modal.present();
  }

  public clickAd(): void {
    console.log('clickAd: ', 'clickAd');
  }

  public getMainSponsor(): string {
    return '/assets/img/menu/day-0.jpg';
  }

  public getInlineSponsor(sponsors?: Sponsor[]): string {
    if (!sponsors) {
      return '';
    }

    return sponsors.map((s) => s.title).join(', ');
  }

  public openAddToMyCalendar(): void {
    this.showAddToMyCalendar = true;
  }

  public getModeratorsTitle(moderators?: Speaker[]): string {
    // if (moderators?.find((m) => m.role.name?.toLowerCase().includes('participant'))) {
    //   return moderators?.length === 1 ? this.translate.instant('session.attendees.one_title') : this.translate.instant('session.attendees.title');
    // } else {
    //   return moderators?.length === 1 ? this.translate.instant('session.speaker.one_title') : this.translate.instant('session.speaker.title');
    // }
    return moderators?.length === 1
      ? this.translate.instant('session.moderators.one_title')
      : this.translate.instant('session.moderators.title');
  }

  public getSpeakersTitle(speakers?: Speaker[]): string {
    // if (speakers?.find((m) => m.role.name?.toLowerCase().includes('participant'))) {
    //   return speakers?.length === 1 ? this.translate.instant('session.attendees.one_title') : this.translate.instant('session.attendees.title');
    // } else {
    //   return speakers?.length === 1 ? this.translate.instant('session.speaker.one_title') : this.translate.instant('session.speaker.title');
    // }
    return speakers?.length === 1 ? this.translate.instant('session.speaker.one_title') : this.translate.instant('session.speaker.title');
  }

  public getFacultiesTitle(faculties?: Speaker[]): string {
    if (this.session?.hidden) {
      return faculties?.length === 1
        ? this.translate.instant('session.attendees.one_title')
        : this.translate.instant('session.attendees.title');
    } else {
      return faculties?.length === 1
        ? this.translate.instant('session.speaker.one_title')
        : this.translate.instant('session.speaker.title');
    }
  }

  public handleChangeRating(rating: number): void {
    this.rating = rating;
    this.rateService.setRateSession(this.session, this.rating);
  }

  public handleRemoveRating(): void {
    this.rating = 0;
    this.rateService.setRateSession(this.session, this.rating);
  }

  public showRating(): boolean {
    const excludedTypes = ['Case in Point', 'Symposium', 'Tools and techniques', 'Ceremony'].map((v) => v.toLowerCase());

    if (this.session?.tracks.find((t) => excludedTypes.includes(t.title.toLowerCase()))) {
      return false;
    }

    return this.session && this.session.sponsors.length === 0;
  }

  public getInitials(speaker: Speaker): string {
    if (!speaker) {
      return ' ';
    }

    return `${speaker.firstName?.charAt(0) ?? ''}${speaker.lastName?.charAt(0) ?? ''}`.toLocaleUpperCase();
  }

  public openReplayUrl(session: Session) {
    if (session.replayURL) {
      this.inAppBrowserService.openUrl(session.replayURL);
    }
  }

  public openOtherLink(): void {
    if (this.session.otherLink) {
      this.inAppBrowserService.openUrl(this.session.otherLink);
    }
  }

  private getDetails(session: Session): ContactDetailComponentInterface[] {
    // let topics = session?.topics ? session?.topics + '<br><br>' : '';
    // topics += session?.themes
    //   .split(',')
    //   .map((t) => `<li class="${encodeTrack(t)}">${t}</li>`)
    //   .join('');

    return [
      {
        show: session && !session.sponsored && session.sponsors.length > 0 /* || session.sentenceFr */,
        // detail: `<b>${
        //   session?.sentence ? session?.sentence : `${this.translate.instant('session.infos.sponsored-by')} ${session?.sponsors}`
        // }</b>`,
        detail: `<b>${this.displaySponsors(session?.sponsors)}</b>`,
        icon: 'ribbon-outline',
        color: 'congressultralight',
        link: session.idExhibitor ? '/app/tabs/exposants/exposant-details/' + session.idExhibitor : null,
      },
      {
        show: session && session.date && !session.tracks.find((track) => track.title.toLowerCase().includes('Poster'.toLowerCase())),
        detail: session?.date,
        icon: 'calendar-outline',
        color: 'congressultralight',
        class: 'ion-text-capitalize',
      },
      {
        show:
          session &&
          session.timeBegin &&
          session.timeEnd &&
          !session.tracks.find((track) => track.title.toLowerCase().includes('Poster'.toLowerCase())),
        detail: `${session.timeBegin}&nbsp;&ndash;&nbsp;${session.timeEnd}`,
        icon: 'time-outline',
        color: 'congressultralight',
      },
      {
        show: session && session.room,
        detail: session?.room,
        src: 'assets/icon/icon_presentation_light.svg',
        color: 'congressultralight',
        link: 'room__' + session?.room,
      },
      {
        show: session && session.tracks && session.tracks.length > 0,
        detail: session?.tracks.map((t) => t.title).join(', '),
        src:
          session?.tracks?.find((t) => t.title.toLowerCase() === 'Learning'.toLowerCase()) ||
          session?.tracks?.find((t) => t.title.toLowerCase() === 'LIVE Case'.toLowerCase())
            ? session?.tracks?.find((t) => t.title.toLowerCase() === 'Learning'.toLowerCase())
              ? 'assets/icon/icon_learning.svg'
              : 'assets/icon/icon_live.svg'
            : 'assets/icon/icon_type.svg',
        color: 'congressultralight',
      },
      {
        show: session && session?.themes?.length > 0,
        detail: session?.themes?.map((t) => t.name).join(', '),
        src: 'assets/icon/icon_themes-topics.svg',
        color: 'congressultralight',
        class: 'no-events',
      },
      {
        show: session && session?.topics?.length > 0,
        detail: session?.topics?.map((t) => t.title).join(', '),
        src: session && session?.themes?.length > 0 ? undefined : 'assets/icon/icon_themes-topics.svg',
        color: 'congressultralight',
      },
      {
        show: session && session?.hub.length > 0,
        detail: session?.hub.map((h) => h.name).join(', '),
        src: 'assets/icon/icon_hub.svg',
        color: 'congressultralight',
      },
      {
        show: session && session?.focus.length > 0,
        detail: session?.focus.map((f) => f.name).join(', '),
        src: 'assets/icon/icon_focus.svg',
        color: 'congressultralight',
        class: 'no-events',
      },
      // {
      //   show: session && session?.tags?.length > 0,
      //   detail: session?.tags?.map((t) => t.title).join(', '),
      //   icon: 'help-circle-outline',
      //   color: 'congressultralight',
      // },
      {
        show: session && session?.specificMessage,
        detail: `<i><b>${session?.specificMessage}</b></i>`,
        color: '',
      },
      {
        show: session && session?.ownRole?.name,
        detail: this.translate.instant('session.i-am', {
          role: session?.ownRole?.name.toLowerCase(),
        }),
        color: 'congressultralight',
        icon: 'person',
      },
      {
        show: session && session?.tags?.length > 0 && !!session.tags.find((t) => t.title.toLowerCase().includes('replay')),
        detail: this.translate.instant('session.available-on-replay'),
        src: 'assets/icon/icon_replay.svg',
        color: 'congressultralight',
      },
      {
        show: session && session?.tags?.length > 0 && !!session.tags.find((t) => t.title.toLowerCase().includes('interactivité')),
        detail: session.tags.find((t) => t.title.toLowerCase().includes('interactivité'))?.title,
        icon: 'school-outline',
        color: 'congressultralight',
      },
      {
        show: session && session?.tags?.length > 0 && !!session.tags.find((t) => t.title.toLowerCase().includes('lunch box')),
        detail: this.translate.instant('session.lunch-box'),
        src: 'assets/icon/lunch-box.svg',
        color: 'congressultralight',
      },
    ];
  }
}
