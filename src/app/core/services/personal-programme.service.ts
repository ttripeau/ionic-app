import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Schedule } from '../models/schedule.interface';
import { Session } from '../models/session.interface';
import { Speaker } from '../models/speaker.interface';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';
import { TimezoneGapService } from './timezoneGap.service';

@Injectable({
  providedIn: 'root',
})
export class PersonalProgrammeService {
  public appearanceProgramme$: BehaviorSubject<Session[]> = new BehaviorSubject<Session[]>([]);
  public reference?: string;

  private scientificProgramme: Schedule[];
  private trainingProgramme: Schedule[];
  private subCongressesProgramme: { [subCongress: string]: Schedule[] };
  private speakers: Speaker[];

  constructor(
    private store: Store<{
      strapi: StrapiStateInterface;
    }>,
    private storage: Storage,
    private translate: TranslateService,
    private platform: Platform,
    private timezoneGapService: TimezoneGapService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.scientificProgramme = strapi.programme.schedule.scientific;
      this.trainingProgramme = strapi.programme.schedule.training;
      this.subCongressesProgramme = strapi.programme.schedule.subCongress;
      this.speakers = strapi.programme.speakers;
      this.init();
    });
  }

  public async init(): Promise<void> {
    const reference = this.speakers.find((speaker) => speaker.externalReference === '22')?.idSpeaker;
    this.reference = reference;
    if (!reference) {
      this.appearanceProgramme$.next([]);
      return;
    }

    const myScientificProgramme: Session[] = [];

    for (const schedule of this.scientificProgramme) {
      for (const group of schedule.groups) {
        for (const session of group.sessions) {
          for (const faculty of session.faculties) {
            if (faculty.idSpeaker === reference) {
              myScientificProgramme.push({
                ...session,
                ownRole: faculty.role,
              });
              break;
            }
          }
        }
      }
    }

    const myTrainingProgramme: Session[] = [];
    for (const schedule of this.trainingProgramme) {
      for (const group of schedule.groups) {
        for (const session of group.sessions) {
          for (const faculty of session.faculties) {
            if (faculty.idSpeaker === reference) {
              myTrainingProgramme.push({
                ...session,
                ownRole: faculty.role,
              });
              break;
            }
          }
        }
      }
    }

    const mySubCongressesProgramme: Session[] = [];
    for (const subcongress of Object.values(this.subCongressesProgramme ?? {})) {
      for (const schedule of subcongress) {
        for (const group of schedule.groups) {
          for (const session of group.sessions) {
            for (const faculty of session.faculties) {
              if (faculty.idSpeaker === reference) {
                mySubCongressesProgramme.push({
                  ...session,
                  ownRole: faculty.role,
                });
                break;
              }
            }
          }
        }
      }
    }

    const personalProgramme = [...myScientificProgramme, ...myTrainingProgramme, ...mySubCongressesProgramme].map((s) => ({
      ...s,
      doIAppear: true,
    }));

    this.appearanceProgramme$.next(personalProgramme);
    await this.resetSessionNotificationSubscription(personalProgramme);
  }

  private async resetSessionNotificationSubscription(personalProgramme: Session[]): Promise<void> {
    const notificationsFromStorage: number[] | null = await this.storage.get('personal_sessions_notifications');

    if (notificationsFromStorage) {
      for (const notificationId of notificationsFromStorage) {
        await this.storage.set(
          `personal_sessions_notifications`,
          notificationsFromStorage?.filter((v) => v !== notificationId)
        );
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      }
    }

    if (personalProgramme) {
      const generatedOffsetTimezone = this.timezoneGapService.getTimezoneOffsetInMinutes() * 60;
      for (const session of personalProgramme) {
        if (session) {
          const foundSession = this.searchSession(session.idSession);
          if (foundSession) {
            if ((parseInt(foundSession.timeBeginTimeStamp, 10) + generatedOffsetTimezone) * 1000 > new Date().getTime()) {
              this.addNotification(foundSession);
            }
          }
        }
      }
    }
  }

  private searchSession(idSession: number): Session | undefined {
    for (const oneDataScheduleDate in this.scientificProgramme) {
      if (this.scientificProgramme[oneDataScheduleDate]) {
        for (let i = 0; i <= 1; i++) {
          for (const oneSessionScheduled in this.scientificProgramme[oneDataScheduleDate]?.groups[i]?.sessions) {
            if (this.scientificProgramme[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled].idSession === idSession) {
              return this.scientificProgramme[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled];
            }
          }
        }
      }
    }

    for (const oneDataScheduleDate in this.trainingProgramme) {
      if (this.trainingProgramme[oneDataScheduleDate]) {
        for (let i = 0; i <= 1; i++) {
          for (const oneSessionScheduled in this.trainingProgramme[oneDataScheduleDate]?.groups[i]?.sessions) {
            if (this.trainingProgramme[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled].idSession === idSession) {
              return this.trainingProgramme[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled];
            }
          }
        }
      }
    }
  }

  private async addNotification(session: Session): Promise<void> {
    const notificationsFromStorage: number[] | null = await this.storage.get('personal_sessions_notifications');

    if (notificationsFromStorage === null) {
      await this.storage.set(`personal_sessions_notifications`, [session.idSession]);
    } else {
      if (notificationsFromStorage.find((n) => n === session.idSession) === undefined) {
        await this.storage.set(`personal_sessions_notifications`, [...notificationsFromStorage, session.idSession]);
      }
    }

    await this.checkChannel();

    const generatedOffsetTimezone = this.timezoneGapService.getTimezoneOffsetInMinutes() * 60;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: session.idSession,
          title: session.room
            ? `${this.translate.instant('programme.start-soon-in')} ${session.room}`
            : this.translate.instant('programme.start-soon'),
          body: session.title,
          // foreground: true,
          channelId: 'channel_main_notifications',
          extra: {
            uidNotification: Date.now(),
            route: `/app/tabs/programme/session/${session.idDate}/${session.idSession}`,
          },
          schedule: {
            at: new Date((parseInt(session.timeBeginTimeStamp, 10) + generatedOffsetTimezone) * 1000 - 10 * 60000),
          },
        },
      ],
    });
  }

  private async checkChannel(): Promise<void> {
    try {
      if (!this.platform.is('mobileweb')) {
        const listChannels = await LocalNotifications.listChannels();

        if (listChannels.channels.find((c) => c.name === 'main-notifications') === undefined) {
          LocalNotifications.createChannel({
            id: 'channel_main_notifications',
            importance: 5,
            name: 'main-notifications',
            visibility: 1,
            vibration: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
