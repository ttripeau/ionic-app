import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

export interface ContactDetailComponentInterface {
  show?: boolean | string | null;
  link?: string | null;
  class?: string;
  textColor?: string;
  color: string;
  icon?: string;
  src?: string;
  detail?: string | null;
}
@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContactDetailComponent {
  @Input() details: ContactDetailComponentInterface[];

  @Output() clickItem = new EventEmitter<string>();

  public handleClick(link?: string | null): void {
    if (link) {
      this.clickItem.emit(link);
    }
  }
}
