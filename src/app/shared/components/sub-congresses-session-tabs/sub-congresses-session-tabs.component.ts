import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfig, DateCongress } from 'src/app/core/models/config.interface';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';

@Component({
  selector: 'app-sub-congresses-session-tabs',
  templateUrl: './sub-congresses-session-tabs.component.html',
  styleUrls: ['./sub-congresses-session-tabs.component.scss'],
})
export class SubCongressesSessionTabsComponent {
  @Input() actualTab: string = '';

  public appConfig: AppConfig;
  public dateCongress: DateCongress;
  public tabsToShow: DateCongress['subCongresses'] = [];

  constructor(public router: Router, private store: Store<{ strapi: StrapiStateInterface }>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.appConfig = strapi.config.appConfig;
      this.tabsToShow = strapi.config.dateCongress.subCongresses;
    });
  }
}
