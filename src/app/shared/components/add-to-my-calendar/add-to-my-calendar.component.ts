import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Session } from 'src/app/core/models/session.interface';
import { AddToCalendarData, AddToCalendarService } from 'src/app/core/services/add-to-calendar.service';
import { TimezoneGapService } from 'src/app/core/services/timezoneGap.service';

@Component({
  selector: 'app-add-to-my-calendar',
  templateUrl: './add-to-my-calendar.component.html',
  styleUrls: ['./add-to-my-calendar.component.scss'],
})
export class AddToMyCalendarComponent {
  @Input() session: Session;
  @Input() isOpen: boolean = true;

  @Output() closeModal: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(public addToCalendarService: AddToCalendarService, private timezoneGapService: TimezoneGapService) {}

  public addToCalendar(calendar: 'apple' | 'google' | 'iCal' | 'office365' | 'teams' | 'outlook' | 'yahoo'): void {
    if (!this.session) {
      return;
    }

    const gapInSeconds = this.timezoneGapService.getAddToCalendarTimezoneOffsetInMinutes() * 60;
    const startDate = new Date((parseInt(this.session.timeBeginTimeStamp, 10) + gapInSeconds) * 1000);
    const startDateString = `${startDate.getFullYear()}-${`${startDate.getMonth() + 1}`.padStart(2, '0')}-${`${startDate.getDate()}`.padStart(2, '0')}`;
    const endDate = new Date((parseInt(this.session.timeEndTimestamp, 10) + gapInSeconds) * 1000);
    const endDateString = `${endDate.getFullYear()}-${`${endDate.getMonth() + 1}`.padStart(2, '0')}-${`${endDate.getDate()}`.padStart(2, '0')}`;

    const startTime = new Date((parseInt(this.session.timeBeginTimeStamp, 10) + gapInSeconds) * 1000).toLocaleTimeString('jp-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date((parseInt(this.session.timeEndTimestamp, 10) + gapInSeconds) * 1000).toLocaleTimeString('jp-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const data: AddToCalendarData = {
      name: this.session.title,
      startDate: startDateString,
      endDate: endDateString,
      timeZone: this.timezoneGapService.getAddToCalendarTimezone(),
      timeZoneOffset: '',
      iCalFileName: this.session.title,
      startTime,
      endTime,
      description: '',
      location: this.session.room,
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

    this.closePopover();
  }

  public closePopover() {
    this.closeModal.emit();
  }
}
