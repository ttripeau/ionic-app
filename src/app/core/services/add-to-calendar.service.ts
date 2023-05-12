/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { InAppBrowserService } from './in-app-browser.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

export interface AddToCalendarData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timeZoneOffset?: string;
  timeZone?: string;
  name: string;
  description: string;
  location: string;
  recurrence: string;
  iCalFileName: string;
  descriptionHtmlFree?: string;
  icsFile?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddToCalendarService {
  constructor(private platform: Platform, private inAppBrowserService: InAppBrowserService) {}

  public generateGoogle(data: AddToCalendarData): void {
    data = this.decorateData(data);
    // base url
    let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    // generate and add date
    const formattedDate = this.generateTime(data, 'clean', 'google', true);
    url += '&dates=' + formattedDate.start + '%2F' + formattedDate.end;
    // add details (if set)
    if (data.name != null && data.name !== '') {
      url += '&text=' + encodeURIComponent(data.name);
    }
    let tmpDataDescription = '';
    if (data.description != null && data.description !== '') {
      tmpDataDescription = data.description;
    }
    if (data.location != null && data.location !== '') {
      url += '&location=' + encodeURIComponent(data.location);
      if (this.platform.is('ios')) {
        if (tmpDataDescription !== '') {
          tmpDataDescription += '<br><br>';
        }
        tmpDataDescription += '&#128205;: ' + data.location;
      }
    }
    if (tmpDataDescription !== '') {
      url += '&details=' + encodeURIComponent(tmpDataDescription);
    }
    if (data.recurrence != null && data.recurrence !== '') {
      url += '&recur=' + encodeURIComponent(data.recurrence);
    }
    if (this.secureUrl(url)) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  public generateApple(data: AddToCalendarData): void {
    this.generateIcal(data);
  }

  // FUNCTION TO GENERATE THE iCAL FILE (also for the Apple option)
  public async generateIcal(data: AddToCalendarData): Promise<void> {
    // check for a given explicit file
    if (data.icsFile != null && data.icsFile !== '') {
      this.inAppBrowserService.openUrl(data.icsFile);
      return;
    }
    // otherwise, generate one on the fly
    let now = new Date().toISOString();
    const formattedDate = this.generateTime(data, 'clean', 'ical', true);
    let timeslot = '';
    if (formattedDate.allday) {
      timeslot = ';VALUE=DATE';
    }
    const icsLines = ['BEGIN:VCALENDAR', 'VERSION:2.0'];
    const corp = 'https://www.europa-group.com/';
    icsLines.push('PRODID:-// ' + corp + ' // v1.0.0 //EN');
    icsLines.push('CALSCALE:GREGORIAN');
    icsLines.push('BEGIN:VEVENT');
    icsLines.push('UID:' + now + '@add-to-calendar-button');
    icsLines.push(
      'DTSTAMP:' + formattedDate.start,
      'DTSTART' + timeslot + ':' + formattedDate.start,
      'DTEND' + timeslot + ':' + formattedDate.end,
      // making sure it does not exceed 75 characters per line
      'SUMMARY:' + data.name.replace(/.{65}/g, '$&' + '\r\n ')
    );
    if (data.descriptionHtmlFree != null && data.descriptionHtmlFree !== '') {
      icsLines.push(
        // adjusting for intended line breaks + making sure it does not exceed 75 characters per line
        'DESCRIPTION:' + data.descriptionHtmlFree.replace(/\n/g, '\\n').replace(/.{60}/g, '$&' + '\r\n ')
      );
    }
    if (data.location != null && data.location !== '') {
      icsLines.push('LOCATION:' + data.location);
    }
    if (data.recurrence != null && data.recurrence !== '') {
      icsLines.push(data.recurrence);
    }
    now = now.replace(/\.\d{3}/g, '').replace(/[^a-z\d]/gi, '');
    icsLines.push('STATUS:CONFIRMED', 'LAST-MODIFIED:' + now, 'SEQUENCE:0', 'END:VEVENT', 'END:VCALENDAR');
    // const dlurl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsLines.join('\r\n'));
    const dlurl = icsLines.join('\r\n');
    const filename = data.iCalFileName || 'event-to-save-in-my-calendar';

    this.getFile(dlurl, filename);
  }

  // FUNCTION TO GENERATE THE YAHOO URL
  public generateYahoo(data: AddToCalendarData): void {
    // base url
    let url = 'https://calendar.yahoo.com/?v=60';
    // generate and add date
    const formattedDate = this.generateTime(data, 'clean', 'general', true);
    url += '&st=' + formattedDate.start + '&et=' + formattedDate.end;
    if (formattedDate.allday) {
      url += '&dur=allday';
    }
    // add details (if set)
    if (data.name != null && data.name !== '') {
      url += '&title=' + encodeURIComponent(data.name);
    }
    if (data.location != null && data.location !== '') {
      url += '&in_loc=' + encodeURIComponent(data.location);
    }
    if (data.descriptionHtmlFree != null && data.descriptionHtmlFree !== '') {
      // using descriptionHtmlFree instead of description, since Yahoo does not support html tags in a stable way
      url += '&desc=' + encodeURIComponent(data.descriptionHtmlFree);
    }
    if (this.secureUrl(url)) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  // FUNCTION TO GENERATE THE MICROSOFT TEAMS URL
  // Mind that this is still in development mode by Microsoft!
  // (https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/deep-links#deep-linking-to-the-scheduling-dialog)
  // Location, html tags and linebreaks in the description are not supported yet.
  public generateTeams(data: AddToCalendarData): void {
    // base url
    let url = 'https://teams.microsoft.com/l/meeting/new?';
    // generate and add date
    const formattedDate = this.generateTime(data, 'delimiters', 'microsoft', true);
    url += '&startTime=' + formattedDate.start + '&endTime=' + formattedDate.end;
    // add details (if set)
    let locationString = '';
    if (data.name != null && data.name !== '') {
      url += '&subject=' + encodeURIComponent(data.name);
    }
    if (data.location != null && data.location !== '') {
      locationString = encodeURIComponent(data.location);
      url += '&location=' + locationString;
      locationString += ' // '; // preparing the workaround putting the location into the description, since the native field is not supported yet
    }
    if (data.descriptionHtmlFree != null && data.descriptionHtmlFree !== '') {
      // using descriptionHtmlFree instead of description, since Teams does not support html tags
      url += '&content=' + locationString + encodeURIComponent(data.descriptionHtmlFree);
    }
    if (this.secureUrl(url)) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  public generateOutlook(data: AddToCalendarData): void {
    this.generateMicrosoft(data, 'outlook');
  }

  public generateOffice365(data: AddToCalendarData): void {
    this.generateMicrosoft(data, '365');
  }

  // FUNCTION TO GENERATE THE MICROSOFT 365 OR OUTLOOK WEB URL
  private generateMicrosoft(data: AddToCalendarData, type: string = '365'): void {
    // base url
    let url = 'https://';
    if (type === 'outlook') {
      url += 'outlook.live.com';
    } else {
      url += 'outlook.office.com';
    }
    url += '/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent';
    // generate and add date
    const formattedDate = this.generateTime(data, 'delimiters', 'microsoft', true);
    url += '&startdt=' + formattedDate.start + '&enddt=' + formattedDate.end;
    if (formattedDate.allday) {
      url += '&allday=true';
    }
    // add details (if set)
    if (data.name != null && data.name !== '') {
      url += '&subject=' + encodeURIComponent(data.name);
    }
    if (data.location != null && data.location !== '') {
      url += '&location=' + encodeURIComponent(data.location);
    }
    if (data.description != null && data.description !== '') {
      url += '&body=' + encodeURIComponent(data.description.replace(/\n/g, '<br>'));
    }
    if (this.secureUrl(url)) {
      this.inAppBrowserService.openUrl(url);
    }
  }

  // SHARED FUNCTION TO GENERATE A TIME STRING
  private generateTime(
    data: AddToCalendarData,
    style = 'delimiters',
    targetCal = 'general',
    addTimeZoneOffset = false
  ): { start: string; end: string; allday: boolean } {
    const startDate = data.startDate.split('-');
    const endDate = data.endDate.split('-');
    let start = '';
    let startTDate: Date;
    let end = '';
    let endTDate: Date;
    let allday = false;
    if (data.startTime != null && data.endTime != null) {
      // Adjust for timezone, if set (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for either the TZ name or the offset)
      if (data.timeZoneOffset != null && data.timeZoneOffset !== '') {
        // if we have a timezone offset given, consider it
        startTDate = new Date(startDate[0] + '-' + startDate[1] + '-' + startDate[2] + 'T' + data.startTime + ':00.000' + data.timeZoneOffset);
        endTDate = new Date(endDate[0] + '-' + endDate[1] + '-' + endDate[2] + 'T' + data.endTime + ':00.000' + data.timeZoneOffset);
      } else {
        // if there is no offset, we prepare the time, assuming it is UTC formatted
        startTDate = new Date(startDate[0] + '-' + startDate[1] + '-' + startDate[2] + 'T' + data.startTime + ':00.000+00:00');
        endTDate = new Date(endDate[0] + '-' + endDate[1] + '-' + endDate[2] + 'T' + data.endTime + ':00.000+00:00');
        if (data.timeZone != null && data.timeZone !== '') {
          // if a timezone is given, we adjust dynamically with the modern toLocaleString function
          const utcDate = new Date(startTDate.toLocaleString('en-US', { timeZone: 'UTC' }));
          if (data.timeZone === 'currentBrowser') {
            data.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          }
          const tzDate = new Date(startTDate.toLocaleString('en-US', { timeZone: data.timeZone }));
          const calcOffset = utcDate.getTime() - tzDate.getTime();
          startTDate.setTime(startTDate.getTime() + calcOffset);
          endTDate.setTime(endTDate.getTime() + calcOffset);
        }
      }

      start = startTDate.toISOString().replace('.000', '');
      end = endTDate.toISOString().replace('.000', '');
      if (style === 'clean') {
        start = start.replace(/-/g, '').replace(/:/g, '');
        end = end.replace(/-/g, '').replace(/:/g, '');
      }
      if (addTimeZoneOffset) {
        let tzOffsetStart = '';
        let tzOffsetEnd = '';
        if (data.timeZoneOffset != null && data.timeZoneOffset !== '') {
          tzOffsetStart = data.timeZoneOffset;
          tzOffsetEnd = data.timeZoneOffset;
        } else if (data.timeZone != null && data.timeZone !== '') {
          const tzOffsetDateStart = new Date(startTDate.toLocaleString('sv', { timeZone: data.timeZone }));
          const tzOffsetStartSearch = tzOffsetDateStart.toString().match(/GMT(.{5})/g);
          tzOffsetStart = tzOffsetStartSearch?.[0].replace(/GMT(.{3})(.{2})/g, '$1:$2') ?? '';
          const tzOffsetDateEnd = new Date(endTDate.toLocaleString('sv', { timeZone: data.timeZone }));
          const tzOffsetEndSearch = tzOffsetDateEnd.toString().match(/GMT(.{5})/g);
          tzOffsetEnd = tzOffsetEndSearch?.[0].replace(/GMT(.{3})(.{2})/g, '$1:$2') ?? '';
        }
        start = start.slice(0, -1) + tzOffsetStart;
        end = end.slice(0, -1) + tzOffsetEnd;
      }
    } else {
      // would be an allday event then
      allday = true;
      startTDate = new Date(Date.UTC(parseInt(startDate[0], 10), parseInt(startDate[1], 10) - 1, parseInt(startDate[2], 10)));
      let breakStart = startTDate.toISOString().replace(/T(.+)Z/g, '');
      endTDate = new Date(Date.UTC(parseInt(endDate[0], 10), parseInt(endDate[1], 10) - 1, parseInt(endDate[2], 10)));
      if (targetCal === 'google' || targetCal === 'microsoft' || targetCal === 'ical') {
        endTDate.setDate(endTDate.getDate() + 1); // increment the day by 1 for Google Calendar, iCal and Outlook
      }
      let breakEnd = endTDate.toISOString().replace(/T(.+)Z/g, '');
      if (style === 'clean') {
        breakStart = breakStart.replace(/-/g, '');
        breakEnd = breakEnd.replace(/-/g, '');
      }
      start = breakStart;
      end = breakEnd;
    }

    if (targetCal === 'ical') {
      start = start.replace(/\+.*/g, '');
      end = end.replace(/\+.*/g, '');
    }

    const returnObject = { start, end, allday };
    return returnObject;
  }

  // SHARED FUNCTION TO SECURE URLS
  private secureUrl(url: string, throwError = true): boolean {
    if (
      url.match(
        // eslint-disable-next-line max-len
        /((\.\.\/)|(\.\.\\)|(%2e%2e%2f)|(%252e%252e%252f)|(%2e%2e\/)|(%252e%252e\/)|(\.\.%2f)|(\.\.%252f)|(%2e%2e%5c)|(%252e%252e%255c)|(%2e%2e\\)|(%252e%252e\\)|(\.\.%5c)|(\.\.%255c)|(\.\.%c0%af)|(\.\.%25c0%25af)|(\.\.%c1%9c)|(\.\.%25c1%259c))/gi
      )
    ) {
      if (throwError) {
        console.error('Seems like the generated URL includes at least one security issue and got blocked. Please check the calendar button parameters!');
      }
      return false;
    } else {
      return true;
    }
  }

  // CLEAN DATA BEFORE FURTHER VALIDATION (CONSIDERING SPECIAL RULES AND SCHEMES)
  private decorateData(config: AddToCalendarData): AddToCalendarData {
    // cleanup different date-time formats
    config = this.dateCleanup(config);
    // calculate the real date values in case that there are some special rules included (e.g. adding days dynamically)
    config.startDate = this.dateCalculation(config.startDate);
    config.endDate = this.dateCalculation(config.endDate);
    // force click trigger on modal style

    // format RRULE (remove spaces)
    if (config.recurrence != null && config.recurrence !== '') {
      config.recurrence = config.recurrence.replace(/\s+/g, '');
    }

    // if no description or already decorated, return early here
    if (!config.description || config.descriptionHtmlFree) {
      return config;
    }

    // make a copy of the given argument rather than mutating in place
    const data = Object.assign({}, config);
    // standardize any line breaks in the description and transform URLs (but keep a clean copy without the URL magic for iCal)
    data.description = data.description.replace(/<br\s*\/?>/gi, '\n');
    data.descriptionHtmlFree = data.description
      .replace(/\[url\]/gi, '')
      .replace(/(\|.*)\[\/url\]/gi, '')
      .replace(/\[\/url\]/gi, '');
    data.description = data.description.replace(/\[url\]([\w&$+.,:;=~!*'?@^%#|\s\-()/]*)\[\/url\]/gi, (_, p1) => {
      const urlText = p1.split('|');
      let link = '<a href="' + urlText[0] + '" target="_blank" rel="noopener">';
      if (urlText.length > 1 && urlText[1] !== '') {
        link += urlText[1];
      } else {
        link += urlText[0];
      }
      return link + '</a>';
    });
    return data;
  }

  // CALCULATE AND CLEAN UP THE ACTUAL DATES
  private dateCleanup(data: AddToCalendarData): AddToCalendarData {
    // parse date+time format (unofficial alternative to the main implementation)
    if (data.startDate != null) {
      // remove any milliseconds information
      data.startDate = data.startDate.replace(/\.\d{3}/, '').replace('Z', '');
      // identify a possible time information within the date string
      const tmpSplitStartDate = data.startDate.split('T');
      if (tmpSplitStartDate[1] != null) {
        data.startDate = tmpSplitStartDate[0];
        data.startTime = tmpSplitStartDate[1];
      }
    }
    // remove any seconds from time information
    if (data.startTime != null && data.startTime.length === 8) {
      const timeStr = data.startTime;
      data.startTime = timeStr.substring(0, timeStr.length - 3);
    }

    if (data.endDate != null) {
      // remove any milliseconds information
      data.endDate = data.endDate.replace(/\.\d{3}/, '').replace('Z', '');
      // identify a possible time information within the date string
      const tmpSplitStartDate = data.endDate.split('T');
      if (tmpSplitStartDate[1] != null) {
        data.endDate = tmpSplitStartDate[0];
        data.endTime = tmpSplitStartDate[1];
      }
    }
    // remove any seconds from time information
    if (data.endTime != null && data.endTime.length === 8) {
      const timeStr = data.endTime;
      data.endTime = timeStr.substring(0, timeStr.length - 3);
    }

    return data;
  }

  private dateCalculation(dateString: string): string {
    const today = new Date();
    const todayString = today.getUTCMonth() + 1 + '-' + today.getUTCDate() + '-' + today.getUTCFullYear();
    dateString = dateString.replace(/today/gi, todayString);

    const dateStringParts = dateString.split('+');
    const dateParts = dateStringParts[0].split('-');
    let newDate = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
    if (dateParts[0].length < 4) {
      newDate = new Date(parseInt(dateParts[2], 10), parseInt(dateParts[0], 10) - 1, parseInt(dateParts[1], 10));
    }

    // if (dateStringParts[1] != null && dateStringParts[1] > 0) {
    if (dateStringParts[1] != null && dateStringParts[1]) {
      newDate.setDate(newDate.getDate() + parseInt(dateStringParts[1], 10));
    }
    return (
      newDate.getFullYear() +
      '-' +
      ((newDate.getMonth() + 1 < 10 ? '0' : '') + (newDate.getMonth() + 1)) +
      '-' +
      (newDate.getDate() < 10 ? '0' : '') +
      newDate.getDate()
    );
  }

  private async getFile(url: string, filename: string): Promise<void> {
    console.log('url: ', url);
    const res = await Filesystem.writeFile({
      path: `Download/${filename}.ics`,
      data: url,
      directory: Directory.ExternalStorage,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    FileOpener.open({
      filePath: res.uri,
      openWithDefault: true,
      contentType: 'text/calendar',
    })
      .then(() => console.log('File is opened'))
      .catch((error) => console.log('Error opening file', error));
  }
}
