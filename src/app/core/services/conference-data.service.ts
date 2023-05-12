import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from '../store/reducers/strapi.reducer';
import { DateCongress } from 'src/app/core/models/config.interface';

@Injectable({
  providedIn: 'root',
})
export class ConferenceDataService {
  public data: any;
  public dateCongress: DateCongress;

  constructor(public http: HttpClient, private storage: Storage, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.dateCongress = strapi.config.dateCongress;
    });
  }

  public load() {
    if (this.data) {
      return of(this.data);
    } else {
      return this.storage.get('programmeScheduleScientific');
    }
  }

  public loadStrapi(url: string): Observable<any> {
    return this.http.get(url).pipe(catchError((_err) => throwError('error')));
  }

  public loadLocalStrapi(): Observable<any> {
    return this.http.get('/assets/data/init_data.json');
  }

  public handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }

  public init(): Observable<any> {
    if (this.data) {
      return of(this.data);
    } else {
      return this.http.get('assets/data/data.json').pipe(map(this.processData, this));
    }
  }

  public processDataInit(data: any): any {
    this.data = data;

    // loop through each day in the schedule
    this.data.schedule.forEach((day: any) => {
      // loop through each timeline group in the day
      day.groups.forEach((group: any) => {
        // loop through each session in the timeline group
        group.sessions.forEach((session: any) => {
          session.speakers = [];
          if (session.speakerNames) {
            session.speakerNames.forEach((speakerName: any) => {
              const speaker = this.data.speakers.find((s: any) => s.name === speakerName);
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            });
          }
        });
      });
    });

    return this.data;
  }

  public processData(data: any): any {
    this.data = data;

    // loop through each day in the schedule
    this.data.schedule.forEach((day: any) => {
      // loop through each timeline group in the day
      day.groups.forEach((group: any) => {
        // loop through each session in the timeline group
        group.sessions.forEach((session: any) => {
          session.speakers = [];
          if (session.speakerNames) {
            /* session.speakerNames.forEach((speakerName: any) => {
              const speaker = this.data.speakers.find(
                (s: any) => s.name === speakerName
              );
              if (speaker) {
                session.speakers.push(speaker);
                speaker.sessions = speaker.sessions || [];
                speaker.sessions.push(session);
              }
            }); */
          }
        });
      });
    });

    return this.data;
  }

  public getInfoPratique() {
    return this.storage.get('generalInformations');
  }

  public async getTimeline(dayIndex: number, queryText = '', excludeTracks: any[] = [], segment = 'all'): Promise<any> {
    if (dayIndex < 999) {
      const dayTmp = await this.storage.get('programmeScheduleScientific');
      const day = dayTmp[dayIndex];

      day.groups[0].day = this.dateCongress.daysTerms[dayIndex];
      day.groups[1].day = this.dateCongress.daysTerms[dayIndex];

      queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
      const queryWords = queryText.split(' ').filter((w) => !!w.trim().length);

      day.groups.forEach((group: any) => {
        group.hide = true;
        group.sessions.forEach((session: any) => {
          // check if this session should show or not
          this.filterSession(session, queryWords, excludeTracks, segment);

          if (!session.hide) {
            // if this session is not hidden then this group should show
            group.hide = false;
          }
        });
      });

      return day;
    } else {
      const dayTmp = await this.storage.get('programmeScheduleScientific');
      const day = [];

      for (let i = 0; i < dayTmp.length; i++) {
        //  day.concat(dayTmp[i].groups);

        day[day.length] = {
          day: this.dateCongress.daysTerms[i],
          time: dayTmp[i].groups[0].time,
          sessions: dayTmp[i].groups[0].sessions,
        };

        day[day.length] = {
          day: this.dateCongress.daysTerms[i],
          time: dayTmp[i].groups[1].time,
          sessions: dayTmp[i].groups[1].sessions,
        };

        //  day.shownSessions = day.shownSessions ? day.shownSessions : 0;

        queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        const queryWords = queryText.split(' ').filter((w) => !!w.trim().length);

        day.forEach((group: any) => {
          group.hide = true;
          group.sessions.forEach((session: any) => {
            // check if this session should show or not
            this.filterSession(session, queryWords, excludeTracks, segment);

            if (!session.hide) {
              // if this session is not hidden then this group should show
              group.hide = false;
              //  day.shownSessions++;
            }
          });
        });
      }
      return day;
    }
  }

  public filterSession(session: any, queryWords: string[], excludeTracks: any[], segment: string): void {
    let matchesQueryText = false;

    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        if (session.name.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }

    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    let matchesTracks = false;
    session.tracks.forEach((trackName: string) => {
      if (excludeTracks.indexOf(trackName) === -1) {
        matchesTracks = true;
      }
    });

    // if the segment is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      //if (this.user.hasFavorite(session.name)) {
      matchesSegment = true;
      //}
    } else {
      matchesSegment = true;
    }

    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
  }
}
