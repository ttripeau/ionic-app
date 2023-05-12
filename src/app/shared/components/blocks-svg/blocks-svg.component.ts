import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

@Component({
  selector: 'app-blocks-svg',
  templateUrl: './blocks-svg.component.html',
  styleUrls: ['./blocks-svg.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BlockSVGComponent implements OnChanges {
  @Input() block = '1';
  @Input() color = 'white';

  public selectedColor = 'white';

  private templateConfig: TemplateConfig;

  public constructor(private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
    });
  }

  public ngOnChanges() {
    switch (this.color) {
      case 'white':
        this.selectedColor = '#ffffff';
        break;
      case 'light':
        this.selectedColor = '#f1f1f1';
        break;
      case 'dark':
        this.selectedColor = '#222428';
        break;
      case 'congress':
        this.selectedColor = this.templateConfig.colorCongress;
        break;
      case 'congressultralight':
        this.selectedColor = this.templateConfig.colorCongressBis;
        break;
      default:
        break;
    }
  }
}

@Component({
  selector: 'app-blocks-svg-1',
  templateUrl: './blocks-svg-1.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class BlockSVG1Component {
  @Input() color: string = 'white';
}

@Component({
  selector: 'app-blocks-svg-2',
  templateUrl: './blocks-svg-2.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class BlockSVG2Component {
  @Input() color: string = 'white';
}

@Component({
  selector: 'app-blocks-svg-3',
  templateUrl: './blocks-svg-3.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class BlockSVG3Component {
  @Input() color: string = 'white';
}
