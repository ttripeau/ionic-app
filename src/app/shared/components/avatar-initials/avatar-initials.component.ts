import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

@Component({
  selector: 'app-avatar-initials',
  templateUrl: './avatar-initials.component.html',
  styleUrls: ['./avatar-initials.component.scss'],
})
export class AvatarInitialsComponent {
  @Input() firstName?: string;
  @Input() lastName?: string;
  @Input() picture?: string | null;
  @Input() avatarColor: string = 'congress';
  @Input() textColor: string = 'light';
  @Input() avatarSize: number = 50;
  @Input() textSize: number = 22;
  @Input() hasMarginTop: boolean = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  public appConfig: AppConfig;
  public initials: AppConfig;

  constructor(private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
    });
  }

  public getInitials(): string {
    if (!this.firstName || !this.lastName) {
      return ' ';
    }

    return `${this.firstName?.charAt(0) ?? ''}${this.lastName?.charAt(0) ?? ''}`.toLocaleUpperCase();
  }

  public handleCLick(event: MouseEvent) {
    this.clicked.emit(event);
  }
}
