import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

export interface HorizontalButtonIcon {
  name?: string;
  src?: string;
}

@Component({
  selector: 'app-horizontal-button',
  templateUrl: './horizontal-button.component.html',
  styleUrls: ['./horizontal-button.component.scss'],
})
export class HorizontalButtonComponent {
  @Input() icon: HorizontalButtonIcon = {};
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() colorTitle: string = 'dark';
  @Input() colorIcon: string;
  @Input() colorChevron: string;
  @Input() colorText: string = 'dark';
  @Input() colorBg: string = 'congressoutline';
  @Input() className: string = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  public templateConfig: TemplateConfig;

  constructor(
    private store: Store<{ strapi: StrapiStateInterface }>,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
    });
  }

  public handleCLick(event: MouseEvent) {
    this.clicked.emit(event);
  }
}
