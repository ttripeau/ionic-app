/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataFilter } from '../store/reducers/strapi.reducer';
import { Store } from '@ngrx/store';
import { AppStoreState } from '../core.module';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class AppUrlOpenService {
  public appIsUrlOpen?: string = undefined;

  private filtersScientific: DataFilter;
  private filtersTraining: DataFilter;

  constructor(private router: Router, private store: Store<AppStoreState>) {
    this.store.select('strapi').subscribe((strapi) => {
      this.filtersScientific = cloneDeep(strapi.programme.filters.scientific);
      this.filtersTraining = cloneDeep(strapi.programme.filters.training);
    });
  }

  public setUrlOpen(url: string) {
    if (url) {
      this.appIsUrlOpen = url;
    }
  }

  public useUrl() {
    if (this.appIsUrlOpen) {
      const regexp = /room=(.+)&|room=(.+)$/;
      const chunks = this.appIsUrlOpen.match(regexp);
      const group1 = chunks?.[1];
      const group2 = chunks?.[2];
      const result = group1 || group2;
      if (result) {
        let roomFound = this.filtersScientific?.room?.find((r) => r.id + '' === result);
        if (!roomFound) {
          roomFound = this.filtersTraining?.room?.find((r) => r.id + '' === result);
        }

        if (roomFound) {
          this.appIsUrlOpen = this.appIsUrlOpen.replace(result, encodeURIComponent(roomFound.val));
        }
      }
      this.router.navigateByUrl('/' + this.appIsUrlOpen, { replaceUrl: true });
      this.appIsUrlOpen = undefined;
    }
  }
}
