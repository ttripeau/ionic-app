import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { AppStoreState } from 'src/app/core/core.module';
import { Filter } from 'src/app/core/models/config.interface';
import { LeveledCircles, LeveledPolygons } from 'src/app/core/models/interactive-map.interface';
import { setProgrammeFiltersScientific } from 'src/app/core/store/actions/strapi.actions';
import { resetProgrammeScientificFilters } from 'src/app/core/utils/reset-filters.utils';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.modal.html',
  styleUrls: ['./room-detail.modal.scss'],
})
export class RoomDetailModal {
  @Input() room: LeveledPolygons | LeveledCircles;

  private filtersConfig: {[key: string]: Filter[] } = {};

  constructor(private modalController: ModalController, private store: Store <AppStoreState>, private router: Router) {
    this.store.select('strapi').subscribe(strapi=>{
      this.filtersConfig = cloneDeep(strapi.programme.filters.scientific);
    });
  }

  public async closeModal(url?: string): Promise<void> {
    await this.modalController.dismiss(url ? { url } : undefined);
  }

  public async goToProgrammeFiltered( exhibitor: LeveledPolygons['exhibitor']): Promise<void>  {
    resetProgrammeScientificFilters(this.filtersConfig);
    this.filtersConfig?.room?.forEach((v) => {
      if (v.val === exhibitor?.name) {
        v.isChecked = true;
      }
    });
    this.store.dispatch(setProgrammeFiltersScientific({ filters: this.filtersConfig }));
    await this.modalController.dismiss(undefined);
    this.router.navigate(['/app/tabs/programme']);
  }

}
