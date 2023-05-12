import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateToSince',
})
export class DateToSincePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: Date): string {
    const currentDate: Date = new Date();
    const seconds = this.translate.instant('messages.seconds');
    const minute = this.translate.instant('messages.minute');
    const hour = this.translate.instant('messages.hour');
    const day = this.translate.instant('messages.day');
    const start = this.translate.currentLang === 'fr' ? this.translate.instant('messages.date') : '';
    const end = this.translate.currentLang === 'en' ? this.translate.instant('messages.date') : '';

    const difference = (currentDate.getTime() - value.getTime()) / 1000;

    const oneMinute = 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    if (difference < 0) {
      return `${start}0 ${seconds} ${end}`;
    }

    if (difference <= oneMinute) {
      return `${start}${Math.round(difference)} ${seconds} ${end}`;
    }

    if (difference < oneHour) {
      return `${start}${Math.floor(difference / oneMinute)} ${minute}${Math.floor(difference / oneMinute) > 1 ? 's' : ''} ${end}`;
    }

    if (difference < oneDay) {
      return `${start}${Math.floor(difference / oneHour)} ${hour}${Math.floor(difference / oneHour) > 1 ? 's' : ''} ${end}`;
    }

    return `${start}${Math.floor(difference / oneDay)} ${day}${Math.floor(difference / oneDay) > 1 ? 's' : ''} ${end}`;
  }
}
