import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { Filter } from 'src/app/core/models/config.interface';
import { DataFilter } from 'src/app/core/store/reducers/strapi.reducer';

export interface FiltersIconsInterface {
  val: string;
  icon: {
    name?: string;
    src?: string;
  };
  background?: string;
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.modal.html',
  styleUrls: ['./filters.modal.scss'],
})
export class FiltersModal implements OnChanges, OnInit {
  @Input() filters: DataFilter = {};
  @Input() config: FiltersIconsInterface[] = [];

  public selectedFilter: string = '';
  public showThemes: boolean = false;
  public entriesToShow: Filter[] = [];

  private index = 0;
  private howManyToShow = 50;

  constructor(private modalController: ModalController) {}

  public ngOnInit(): void {
    const topicsThemesLength = this.filters?.topics?.filter((topic) => topic.isTheme)?.length;
    this.showThemes = topicsThemesLength ? topicsThemesLength > 1 : false;
  }

  public ngOnChanges(): void {
    const topicsThemesLength = this.filters?.topics?.filter((topic) => topic.isTheme)?.length;
    this.showThemes = topicsThemesLength ? topicsThemesLength > 1 : false;
  }

  public changeSelectedFilter(filter: string): void {
    this.index = 0;
    if (filter === this.selectedFilter) {
      this.selectedFilter = '';
      this.entriesToShow = [];
    } else {
      this.selectedFilter = filter;
      this.entriesToShow = this.filters[filter].slice(0, (this.index + 1) * this.howManyToShow);
    }
  }

  public getConfig(): FiltersIconsInterface[] {
    return this.config.filter((c) => this.filters?.[c?.val]?.length > 0);
  }

  public getFiltersActive(): { [key: string]: Filter[] | boolean | DataFilter; isDismiss: boolean; filters: DataFilter } {
    const result: {
      [key: string]: Filter[] | boolean | DataFilter;
      isDismiss: boolean;
      filters: DataFilter;
    } = {
      isDismiss: false,
      filters: this.filters,
    };

    for (const key in this.filters) {
      if (this.filters[key]) {
        result[key] = this.filters[key].filter((val) => val.isChecked);
      }
    }

    return result;
  }

  public async validFormFilters(): Promise<void> {
    const data = this.getFiltersActive();
    await this.modalController.dismiss(data);
  }

  public async closeModal(): Promise<void> {
    const data = { isDismiss: true, filter: undefined };
    await this.modalController.dismiss(data);
  }

  public getName(filter: FiltersIconsInterface): string | undefined {
    const config = this.config.find((c) => c.val === filter.val);
    return config ? config.icon.name : '';
  }

  public getSrc(filter: FiltersIconsInterface): string | undefined {
    const config = this.config.find((c) => c.val === filter.val);
    return config ? config.icon.src : '';
  }

  public onIonInfinite(ev: Event, filters: Filter[]): void {
    this.index++;
    this.entriesToShow = [...this.entriesToShow, ...filters.slice(this.index * this.howManyToShow, (this.index + 1) * this.howManyToShow)];
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
      if (this.entriesToShow.length >= filters.length) {
        (ev as InfiniteScrollCustomEvent).target.disabled = true;
      }
    }, 50);
  }
}
