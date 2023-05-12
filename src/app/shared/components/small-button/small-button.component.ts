import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

export interface SmallButtonIcon {
  name?: string;
  src?: string;
}

@Component({
  selector: 'app-small-button',
  templateUrl: './small-button.component.html',
  styleUrls: ['./small-button.component.scss'],
})
export class SmallButtonComponent {

  @Input() icon: SmallButtonIcon = {};
  @Input() iconEnd: SmallButtonIcon = {};
  @Input() text: string = '';
  @Input() color: string = 'congress';
  @Input() colorText: string = 'light';

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
