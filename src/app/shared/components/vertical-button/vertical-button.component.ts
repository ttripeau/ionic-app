import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

export interface VerticalButtonIcon {
  name?: string;
  src?: string;
}

@Component({
  selector: 'app-vertical-button',
  templateUrl: './vertical-button.component.html',
  styleUrls: ['./vertical-button.component.scss'],
})
export class VerticalButtonComponent {

  @Input() icon: VerticalButtonIcon = {};
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() colorText: string = 'dark';
  @Input() colorBg: string = 'congressoutline';
  @Input() className: string = 'base';

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
