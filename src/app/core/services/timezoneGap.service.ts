import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppConfig } from '../models/config.interface';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';

@Injectable({
  providedIn: 'root',
})
export class TimezoneGapService {
  private appConfig?: AppConfig = undefined;

  constructor(private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
    });
  }

  public getTimezoneOffsetInMinutes(): number {
    return this.appConfig?.gapTimezoneMinutesProgramme !== undefined ? this.appConfig?.gapTimezoneMinutesProgramme : -480;
  }

  public getAddToCalendarTimezoneOffsetInMinutes(): number {
    return this.appConfig?.addToCalendar?.offsetTimezoneMinutes !== undefined ? this.appConfig?.addToCalendar?.offsetTimezoneMinutes : 60;
  }

  public getAddToCalendarTimezone(): string {
    return this.appConfig?.addToCalendar?.timezone !== undefined ? this.appConfig?.addToCalendar?.timezone : 'Asia/Tokyo';
  }
}
