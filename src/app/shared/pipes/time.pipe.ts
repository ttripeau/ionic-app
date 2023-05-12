import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value: string): string {
    const chunks = value.split(':');

    return chunks[0] + 'h' + chunks[1];
  }
}
