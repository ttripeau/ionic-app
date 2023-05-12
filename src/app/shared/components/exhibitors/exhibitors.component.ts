import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, ModalController, Platform, ToastController } from '@ionic/angular';
import { State, Store } from '@ngrx/store';
import { DataConfig, Filter, TemplateConfig } from 'src/app/core/models/config.interface';
import { Exhibitor } from 'src/app/core/models/exhibitor.interface';
import { DataFilter, StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { TranslateService } from '@ngx-translate/core';
import { setExhibitorsFilters, setStrapi } from 'src/app/core/store/actions/strapi.actions';
import { FiltersModal } from '../../modals/filters/filters.modal';
import { cloneDeep, merge } from 'lodash';
import { AppStoreState } from 'src/app/core/core.module';

interface FilterSelectedInterface {
  key: string;
  value: string[];
}

enum ExhibitorOrder {
  platinum = 'platinum',
  gold = 'gold',
  silver = 'silver',
  bronze = 'bronze',
  normal = 'normal',
}

@Component({
  selector: 'app-exhibitors',
  templateUrl: './exhibitors.component.html',
  styleUrls: ['./exhibitors.component.scss'],
})
export class ExhibitorsComponent implements OnInit {
  public templateConfig: TemplateConfig;
  public dataConfig: DataConfig;

  public filtersSelected: FilterSelectedInterface[] = [];
  public exposantsToShow: Exhibitor[] = [];
  public showFilters: boolean = false;
  public isLoading: boolean = false;
  public isios: boolean = false;

  public platinumExhibitors: Exhibitor[] = [];
  public goldExhibitors: Exhibitor[] = [];
  public silverExhibitors: Exhibitor[] = [];
  public bronzeExhibitors: Exhibitor[] = [];
  public normalExhibitors: Exhibitor[] = [];

  private exposantsStorage: Exhibitor[] = [];
  private filters: DataFilter = {};

  constructor(
    private store: Store<AppStoreState>,
    private state: State<AppStoreState>,
    private modalController: ModalController,
    private toastController: ToastController,
    private routerOutlet: IonRouterOutlet,
    private translate: TranslateService,
    private platform: Platform,
    private router: Router,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.init(strapi);
    });
  }

  ngOnInit() {
    this.loadConfig();
  }

  public async filterList(): Promise<void> {
    this.isLoading = true;
    this.exposantsToShow = [];
    const stateValue = (await this.state.getValue()) as AppStoreState;
    const queryText = this.formatString(stateValue.strapi.config.dataConfig.queryText.exhibitor);

    let isEmpty = true;
    for (const filters of this.filtersSelected) {
      if (filters.value.length > 0) {
        isEmpty = false;
        break;
      }
    }

    this.exposantsToShow = this.exposantsStorage.filter((item) => {
      let canAdd = false;
      let canAddQueryText = true;

      if (queryText) {
        canAddQueryText = this.formatString(item.name)?.indexOf(queryText) > -1;
      }

      for (const filters of this.filtersSelected) {
        const key = item[filters.key as keyof typeof item] as string;
        if (filters.value.length > 0 && !filters.value.includes(key)) {
          canAdd = true;
          break;
        }
      }

      return canAddQueryText && (canAdd || isEmpty);
    });

    this.platinumExhibitors = this.exposantsToShow.filter((exhibitor) => exhibitor.order === ExhibitorOrder.platinum);
    this.goldExhibitors = this.exposantsToShow.filter((exhibitor) => exhibitor.order === ExhibitorOrder.gold);
    this.silverExhibitors = this.exposantsToShow.filter((exhibitor) => exhibitor.order === ExhibitorOrder.silver);
    this.bronzeExhibitors = this.exposantsToShow.filter((exhibitor) => exhibitor.order === ExhibitorOrder.bronze);
    this.normalExhibitors = this.exposantsToShow.filter((exhibitor) => exhibitor.order === ExhibitorOrder.normal);

    this.syncFilters();

    this.isLoading = false;

    if (!isEmpty) {
      const toast = await this.toastController.create({
        message: `${this.exposantsToShow.length} ${this.translate.instant('exhibitors.exhibitors-found')}`,
        duration: 2000,
        color: 'light',
        cssClass: 'tabs-bottom',
      });
      toast.present();
    }
  }

  public deleteFilter(filter: string, list: string): void {
    const t = this.filters[list].find((a) => a.val === filter);
    if (t) {
      t.isChecked = false;
    }

    const badgeToFilter = this.filtersSelected.find((f) => f.key === list);
    if (badgeToFilter) {
      badgeToFilter.value = badgeToFilter.value.filter((f) => f !== filter);
    }

    this.store.dispatch(
      setExhibitorsFilters({
        filters: merge({}, this.filters),
      })
    );

    this.syncFilters();
    this.filterList();
  }

  public imgError(event: any): void {
    const img = event.srcElement.shadowRoot.children[0];
    img.src = 'assets/img/default-imgs/default-speaker.jpg';
  }

  public async openModalFilterExhibitors(): Promise<void> {
    const modal = await this.modalController.create({
      component: FiltersModal,
      componentProps: {
        filters: cloneDeep(this.filters),
        config: [
          {
            val: 'theme',
            icon: { name: 'bookmark-outline' },
          },
          {
            val: 'topics',
            icon: { name: 'chat-bubble' },
          },
          {
            val: 'tracks',
            icon: { name: 'calendar' },
          },
          {
            val: 'location',
            icon: { name: 'locate-outline' },
          },
          {
            val: 'sponsors',
            icon: { src: 'assets/icon/store.svg' },
          },
        ],
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      cssClass: 'modal-wrapper',
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      if (dataReturned.role === 'gesture' || dataReturned?.data?.isDismiss) {
        return;
      }

      if (dataReturned?.data !== undefined && dataReturned?.data?.filters) {
        this.store.dispatch(
          setExhibitorsFilters({
            filters: merge({}, this.filters, dataReturned.data.filters),
          })
        );
        await this.filterList();
      }
    });

    return await modal.present();
  }

  public updateQueryText(event: any): void {
    const stateValue = this.state.getValue() as AppStoreState;
    const strapi = stateValue.strapi;
    this.store.dispatch(
      setStrapi({
        strapi: {
          ...strapi,
          config: {
            ...strapi.config,
            dataConfig: {
              ...strapi.config.dataConfig,
              queryText: {
                ...strapi.config.dataConfig.queryText,
                exhibitor: event?.target?.value ? event?.target?.value : '',
              },
            },
          },
        },
      })
    );
    this.syncFilters();
    this.filterList();
  }

  public goToProducts(): void {
    this.router.navigate(['/app/tabs/produits']);
  }

  private syncFilters(): void {
    let showFiltersTemp = false;
    this.filtersSelected = [];
    for (const [key, value] of Object.entries<Filter[]>(this.filters)) {
      showFiltersTemp = value.filter((f) => f.isChecked).length > 0 || showFiltersTemp;
      this.filtersSelected.push({
        key,
        value: value.filter((f) => f.isChecked).map((v) => v.val) as string[],
      });
    }

    this.showFilters = cloneDeep(showFiltersTemp);
  }

  private loadConfig(): void {
    this.isios = this.platform.is('ios');
  }

  private init(strapi: StrapiStateInterface): void {
    this.filters = cloneDeep(strapi.exhibitors.filters);
    this.dataConfig = strapi.config.dataConfig;
    this.templateConfig = strapi.config.templateConfig;
    this.exposantsStorage = [...strapi.exhibitors.content].filter((e: Exhibitor) => e.type === 'exposant');
    this.filterList();
  }

  private formatString(value: string): string {
    return (
      value
        ?.toLowerCase()
        .replace(/,|\.|-/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim() ?? ''
    );
  }
}
