import { Component } from '@angular/core';
import { State, Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { DataConfig, DateCongress } from 'src/app/core/models/config.interface';
import { FavoriteSessionInterface } from 'src/app/core/store/reducers/my-program.reducer';
import { getCountDown, getCountDownDays, getCountDownHours, getCountDownMins } from 'src/app/core/utils/home.utils';
import { Session } from 'src/app/core/models/session.interface';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { PersonalProgrammeService } from 'src/app/core/services/personal-programme.service';
import { TimezoneGapService } from 'src/app/core/services/timezoneGap.service';

@Component({
  selector: 'app-mes-sessions',
  templateUrl: './mes-sessions.page.html',
  styleUrls: ['./mes-sessions.page.scss'],
})
export class MesSessionsPage {
  public favoritesSessions: Session[] = [];
  public text?: string = '';

  private dateCongress: DateCongress;
  private dataConfig: DataConfig;
  private actualDate: Date;

  constructor(
    private store: Store<{ strapi: StrapiStateInterface; favoriteSessions: FavoriteSessionInterface }>,
    private state: State<{ favoriteSessions: FavoriteSessionInterface }>,
    private translate: TranslateService,
    private personalProgrammeService: PersonalProgrammeService,
    private timezoneGapService: TimezoneGapService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.init(strapi);
    });
    this.store.select('favoriteSessions').subscribe(() => {
      this.loadFavoritesSessions();
    });
    this.personalProgrammeService.appearanceProgramme$.subscribe(() => {
      this.loadFavoritesSessions();
    });
  }

  public ionViewWillEnter(): void {
    this.store
      .select('strapi')
      .pipe(take(1))
      .subscribe((strapi) => {
        this.init(strapi);
      });
  }

  public init(strapi: StrapiStateInterface): void {
    this.dateCongress = strapi.config.dateCongress;
    this.dataConfig = strapi.config.dataConfig;
    this.text = strapi.config.appConfig.texts?.mySessions;
    this.loadFavoritesSessions();
  }

  public getTranslatedDate(session: Session): string {
    const offset = this.timezoneGapService.getTimezoneOffsetInMinutes();

    return new Date((parseInt(session.dateTimestamp, 10) + offset * 60) * 1000).toLocaleDateString(this.translate.currentLang, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  private sortFunction(a: Session, b: Session) {
    if (!a || !b) {
      return 0;
    }
    if (a.timeBeginTimeStamp !== b.timeBeginTimeStamp) {
      return parseInt(a.timeBeginTimeStamp, 10) - parseInt(b.timeBeginTimeStamp, 10);
    }
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
  }

  private async loadFavoritesSessions() {
    const appearanceSession = this.personalProgrammeService.appearanceProgramme$.getValue();

    this.actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();

    this.favoritesSessions = [];
    const stateValue = await this.state.getValue();
    let dataStorage = stateValue.favoriteSessions?.filter(
      (fs: Session, index: number, self: Session[]) => self.findIndex((f) => f?.idSession === fs?.idSession) === index
    );
    if (dataStorage && dataStorage.length) {
      let progress = 0;
      dataStorage = dataStorage.sort((a: Session, b: Session) => this.sortFunction(a, b));
      for (const data of dataStorage) {
        if (data) {
          const startDate: Date = new Date(parseInt(data.timeStartTimestamp, 10) * 1000);
          const endDate: Date = new Date(parseInt(data.timeEndTimestamp, 10) * 1000);
          progress =
            1 -
            (parseInt(data.timeEndTimestamp, 10) * 1000 - this.actualDate.getTime()) /
              (parseInt(data.timeEndTimestamp, 10) * 1000 - parseInt(data.timeStartTimestamp, 10) * 1000);

          // if(progress < 1) {
          this.favoritesSessions.push({
            ...data,
            isfavorite: true,
            progress,
            decalage: Math.floor(getCountDown(endDate, this.actualDate)),
            decalageDays: Math.floor(getCountDownDays(startDate, this.actualDate)),
            decalageHours: Math.floor(getCountDownHours(startDate.getTime(), this.actualDate)),
            decalageMins: Math.floor(getCountDownMins(startDate.getTime(), this.actualDate)),
          });
          // }
        }
      }
    }
    this.favoritesSessions = [...this.favoritesSessions, ...appearanceSession]
      .filter((session, index, self) => self.findIndex((s) => s.idSession === session.idSession) === index)
      .sort((a, b) => {
        if (!a || !b) {
          return 0;
        }
        if (a.timeBeginTimeStamp !== b.timeBeginTimeStamp) {
          return parseInt(a.timeBeginTimeStamp, 10) - parseInt(b.timeBeginTimeStamp, 10);
        }
        if (a.timeEndTimestamp !== b.timeEndTimestamp) {
          return parseInt(a.timeEndTimestamp, 10) - parseInt(b.timeEndTimestamp, 10);
        }
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
