/* eslint-disable @typescript-eslint/naming-convention */
import { Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { State, Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';

import { FavoriteSessionInterface } from 'src/app/core/store/reducers/my-program.reducer';
import { setFavoriteSessions } from 'src/app/core/store/actions/my-program.action';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

import { Schedule } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { LocalNotifications } from '@capacitor/local-notifications';
import { TimezoneGapService } from './timezoneGap.service';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class MyProgramService {
  public schedule: Schedule[];
  public trainingSchedule: Schedule[];

  constructor(
    private state: State<{ favoriteSessions: FavoriteSessionInterface[] }>,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private toastController: ToastController,
    private translate: TranslateService,
    private platform: Platform,
    private storage: Storage,
    private timezoneGapService: TimezoneGapService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.schedule = strapi.programme.schedule.scientific;
      this.trainingSchedule = strapi.programme.schedule.training;
    });

  }

  public async init(): Promise<void> {
    const dataStorage = (await this.storage.get('favorites_sessions')) || [];
    this.store.dispatch(setFavoriteSessions({ favoriteSessions: dataStorage }));

    await this.syncMyProgramme();

    this.platform.resume.subscribe(async () => {
      await this.syncMyProgramme();
    });
  }

  public async hasRemoteAccess() {
    return false;
  }

  public async addFavorite(oneSession: Session, showToast = true): Promise<Session[]> {
    const stateValue = await this.state.getValue();
    const dataStorage = cloneDeep(stateValue.favoriteSessions);

    const favSessionStored = dataStorage && dataStorage.length ? dataStorage : [];
    if (!favSessionStored.find((fav: Session) => fav?.idSession === oneSession?.idSession)) {
      favSessionStored.push(cloneDeep(oneSession));
    }

    this.store.dispatch(setFavoriteSessions({ favoriteSessions: favSessionStored }));

    this.storage.set('favorites_sessions', favSessionStored).then(async () => {
      if (showToast) {
        const toast = await this.toastController.create({
          message: this.translate.instant('programme.saved-my-programme'),
          duration: 3000,
          color: 'light',
          cssClass: 'tabs-bottom',
        });
        toast.present();
      }
    });

    this.addNotification(oneSession);

    return favSessionStored;
  }

  public async addNotification(session: Session): Promise<void> {
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

  public async removeNotification(session: Session): Promise<void> {
    if (session.idSession) {
      const notificationsFromStorage: number[] | null = await this.storage.get('sessions_notifications');
      await this.storage.set(
        `sessions_notifications`,
        notificationsFromStorage?.filter((v) => v !== session.idSession)
      );
      await LocalNotifications.cancel({ notifications: [{ id: session.idSession }] });
    }
  }

  public async removeFavorite(oneSession: Session): Promise<Session[]> {
    const { decalageDays, decalageHours, decalageMins, progress, ...rest } = oneSession;
    console.log('rest: ', rest);

    const stateValue = await this.state.getValue();
    const dataStorage = cloneDeep(stateValue.favoriteSessions);

    let favSessionStored = dataStorage && dataStorage.length ? dataStorage : [];
    // eslint-disable-next-line eqeqeq
    favSessionStored = favSessionStored?.filter((fs: Session) => fs?.idSession && fs.idSession != oneSession.idSession);

    this.store.dispatch(setFavoriteSessions({ favoriteSessions: favSessionStored }));

    this.storage.set('favorites_sessions', favSessionStored).then(async () => {
      const toast = await this.toastController.create({
        message: this.translate.instant('programme.removed-my-programme'),
        duration: 3000,
        color: 'light',
        cssClass: 'tabs-bottom',
      });
      toast.present();
      // }
    });

    this.removeNotification(oneSession);

    return favSessionStored;
  }

  public async syncMyProgramme(): Promise<void> {
    await this.resetSessionNotificationSubscription();
  }

  public searchSession(idSession: number): Session | undefined {
    for (const oneDataScheduleDate in this.schedule) {
      if (this.schedule[oneDataScheduleDate]) {
        for (let i = 0; i <= 1; i++) {
          for (const oneSessionScheduled in this.schedule[oneDataScheduleDate]?.groups[i]?.sessions) {
            if (this.schedule[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled].idSession === idSession) {
              return this.schedule[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled];
            }
          }
        }
      }
    }

    for (const oneDataScheduleDate in this.trainingSchedule) {
      if (this.trainingSchedule[oneDataScheduleDate]) {
        for (let i = 0; i <= 1; i++) {
          for (const oneSessionScheduled in this.trainingSchedule[oneDataScheduleDate]?.groups[i]?.sessions) {
            if (this.trainingSchedule[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled].idSession === idSession) {
              return this.trainingSchedule[oneDataScheduleDate]?.groups[i]?.sessions[oneSessionScheduled];
            }
          }
        }
      }
    }
  }

  public async resetSessionNotificationSubscription(): Promise<void> {
    const notificationsFromStorage: number[] | null = await this.storage.get('sessions_notifications');

    if (notificationsFromStorage) {
      for (const notificationId of notificationsFromStorage) {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      }
    }

    const generatedOffsetTimezone = this.timezoneGapService.getTimezoneOffsetInMinutes() * 60;
    const favSesions = (await this.storage.get('favorites_sessions')) as FavoriteSessionInterface[];

    if (favSesions) {
      for (const session of favSesions) {
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
