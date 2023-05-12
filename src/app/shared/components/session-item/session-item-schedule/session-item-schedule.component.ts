import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MyProgramService } from 'src/app/core/services/my-program.service';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { DateCongress, TemplateConfig } from 'src/app/core/models/config.interface';
import { FavoriteSessionDay } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { addFavorite, encodeTrack, removeFavorite } from 'src/app/core/utils/session-item.utils';
import { Specialty } from 'src/app/core/models/specialty.interface';
import { Sponsor } from 'src/app/core/models/sponsor.interface';
import { Type } from 'src/app/core/models/type.interface';
import { AddToCalendarData, AddToCalendarService } from 'src/app/core/services/add-to-calendar.service';
import { Focus } from 'src/app/core/models/focus.interface';
import { Router } from '@angular/router';
import { TimezoneGapService } from 'src/app/core/services/timezoneGap.service';
import { Topic } from 'src/app/core/models/topic.interface';
import { Tag } from 'src/app/core/models/tag.interface';
import { Room } from 'src/app/core/models/room.interface';

@Component({
  selector: 'app-session-item-schedule',
  templateUrl: './session-item-schedule.component.html',
  styleUrls: [],
})
export class SessionItemScheduleComponent implements OnInit {
  @Input() hasFavoriteStar = true;
  @Input() session: Session;
  @Input() link: string | null = null;
  @Input() linkQueryParams: { [key: string]: string } = {};
  @Input() listFavorites: Session[];
  @Input() sessionsToShow: FavoriteSessionDay[];
  @Input() indexSessionToShow: number;
  @Input() indexSessionToShowSessions: number;
  @Input() sponsorsFullSize: boolean = false;
  @Input() isMySessions: boolean = false;
  @Input() showTracks: boolean = true;
  @Input() showLocation: boolean = true;
  @Input() showTime: boolean = true;

  public templateConfig: TemplateConfig;
  public isOpen: boolean = false;
  public realShowTime: boolean = true;
  public interactiveTag?: Tag = undefined;

  private dateCongress: DateCongress;

  constructor(
    private myProgramService: MyProgramService,
    private store: Store<{ strapi: StrapiStateInterface }>,
    private addToCalendarService: AddToCalendarService,
    private router: Router,
    private timezoneGapService: TimezoneGapService
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
      this.dateCongress = strapi.config.dateCongress;
    });
  }

  public ngOnInit(): void {
    this.realShowTime = this.showTime && !this.session.tracks.find((track) => track.title.toLowerCase().includes('Poster'.toLowerCase()));
    this.interactiveTag = this.session.tags.find((t) => t.title.toLowerCase().includes('interactivité'));
  }

  public removeFavorite(): void {
    if (this.isMySessions) {
      this.myProgramService.removeFavorite(this.session);
    } else {
      removeFavorite(
        this.myProgramService,
        this.sessionsToShow,
        this.session,
        this.indexSessionToShow,
        this.indexSessionToShowSessions,
        this.listFavorites
      );
    }
  }

  public addFavorite(): void {
    if (this.isMySessions) {
      this.myProgramService.addFavorite(this.session);
    } else {
      addFavorite(
        this.myProgramService,
        this.sessionsToShow,
        this.session,
        this.indexSessionToShow,
        this.indexSessionToShowSessions,
        this.listFavorites
      );
    }
  }

  public encodeTrack(value: Topic[]): string {
    if (!value || value.length > 1) {
      return '';
    }

    return encodeTrack(value[0]?.title);
  }

  public getIcon(): { src?: string; name?: string } {
    const type = this.session.tracks;

    return {
      src:
        type?.find((t) => t.title.toLowerCase() === 'Learning'.toLowerCase()) ||
        type?.find((t) => t.title.toLowerCase() === 'LIVE Case'.toLowerCase())
          ? type?.find((t) => t.title.toLowerCase() === 'Learning'.toLowerCase())
            ? 'assets/icon/icon_learning.svg'
            : 'assets/icon/icon_live.svg'
          : 'assets/icon/icon_type.svg',
      name: undefined,
    };
  }

  public getInlineRooms(rooms: Room[]): string {
    return rooms
      .filter((f) => !!f.name)
      .map((s) => s.name)
      .join(', ');
  }

  public getInlineSponsors(sponsors: Sponsor[]): string {
    return sponsors.map((s) => s.title).join(', ');
  }

  public getInlineThemes(themes: Specialty[]): string {
    return themes
      .filter((f) => !!f.name)
      .map((t) => t.name)
      .join(', ');
  }

  public getInlineTopics(topics: Topic[]): string {
    return topics
      .filter((f) => !!f.title)
      .map((t) => t.title)
      .join(', ');
  }

  public getInlineTracks(tracks: Type[]): string {
    return tracks
      .filter((f) => !!f.title)
      .map((t) => t.title)
      .join(', ');
  }

  public getInlineFocus(focus: Focus[]): string {
    return focus
      .filter((f) => !!f.name)
      .map((f) => f.name)
      .join(', ');
  }

  public addToCalendar(session: Session, calendar: 'apple' | 'google' | 'iCal' | 'office365' | 'teams' | 'outlook' | 'yahoo'): void {
    const date = new Date(parseInt(session.dateTimestamp, 10) * 1000);
    const dateString = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

    const data: AddToCalendarData = {
      name: session.title,
      startDate: dateString,
      endDate: dateString,
      timeZone: 'UTC',
      timeZoneOffset: Math.abs(new Date().getTimezoneOffset()) + '',
      iCalFileName: session.title,
      startTime: session.timeBegin,
      endTime: session.timeEnd,
      description: '',
      location: session.room,
      recurrence: '',
    };

    switch (calendar) {
      case 'apple':
        this.addToCalendarService.generateApple(data);
        break;
      case 'google':
        this.addToCalendarService.generateGoogle(data);
        break;
      case 'iCal':
        this.addToCalendarService.generateIcal(data);
        break;
      case 'office365':
        this.addToCalendarService.generateOffice365(data);
        break;
      case 'teams':
        this.addToCalendarService.generateTeams(data);
        break;
      case 'outlook':
        this.addToCalendarService.generateOutlook(data);
        break;
      case 'yahoo':
        this.addToCalendarService.generateYahoo(data);
        break;
      default:
        break;
    }

    this.isOpen = false;
  }

  public goToLink(): void {
    this.router.navigate([this.link], {
      queryParams: this.linkQueryParams,
    });
  }

  public isSessionPassed(session: Session): boolean {
    const timezoneOffsetInMinutes = this.timezoneGapService.getTimezoneOffsetInMinutes();
    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();

    return actualDate.getTime() > (parseInt(session.timeEndTimestamp, 10) + timezoneOffsetInMinutes * 60) * 1000;
  }

  public isSessionInProgress(session: Session): boolean {
    const timezoneOffsetInMinutes = this.timezoneGapService.getTimezoneOffsetInMinutes();
    const actualDate = this.dateCongress.actualDate ? new Date(this.dateCongress.actualDate) : new Date();
    const endTimestamp = (parseInt(session.timeEndTimestamp, 10) + timezoneOffsetInMinutes * 60) * 1000;
    const startTimestamp = (parseInt(session.timeBeginTimeStamp, 10) + timezoneOffsetInMinutes * 60) * 1000;

    return actualDate.getTime() <= endTimestamp && actualDate.getTime() >= startTimestamp;
  }

  public getSessionColor(session: Session): string {
    if (session.color) {
      return session.color;
    }

    let topicColor = '';
    if (session.topics && session.topics.length === 1) {
      topicColor = session.topics[0].color;
    }

    return topicColor;
  }

  public hasReplay(tags: Tag[]): boolean {
    return !!tags.find((t) => t.title.toLowerCase().includes('replay'));
  }

  public hasLunchBox(tags: Tag[]): boolean {
    return !!tags.find((t) => t.title.toLowerCase().includes('lunch box'));
  }
}
