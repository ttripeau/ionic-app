import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { InteractiveMap, LeveledCircles, LeveledMarkers, LeveledPolygons } from 'src/app/core/models/interactive-map.interface';
import { MapService } from 'src/app/core/services/map.service';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { RoomDetailModal } from '../../modals/interactive-map/room-detail/room-detail.modal';
import { RoomFindModal } from '../../modals/interactive-map/room-find/room-find.modal';
import { RoomWhereAmIModal } from '../../modals/interactive-map/room-where-am-i/room-where-am-i.modal';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() searchEnabled: boolean;
  @Input() coordonates: L.LatLng;
  @Input() zoom: number;

  @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
  @Output() centerChanged: EventEmitter<L.LatLng> = new EventEmitter<L.LatLng>();
  @Output() zoomChanged: EventEmitter<number> = new EventEmitter<number>();

  public defaultHref = '';
  public defaultLevel: number;
  public level = 0;
  public isDisabledZoomIn = false;
  public isDisabledZoomOut = false;
  public isDisabledLevelOut = false;
  public isDisabledLevelIn = false;
  public data: InteractiveMap = {};
  public objectKeys = Object.keys;
  public plateformType: 'ios' | 'md' | 'web' = 'web';

  private actualModal: HTMLIonModalElement;
  private canCLick = true;
  private timeoutZoom: ReturnType<typeof setTimeout> | null = null;
  // private loading: HTMLIonLoadingElement;
  private levelPolygons: (LeveledPolygons | LeveledCircles | LeveledMarkers)[] = [];
  private mainLayer: L.TileLayer;
  private map: L.Map;
  private minZoom = 0;
  private maxZoom = 4;
  private polygonId: number | undefined = undefined;
  private polygonName: string | undefined = undefined;
  private templateConfig: TemplateConfig;
  private subPolygonId: Subscription;
  private subPolygonName: Subscription;

  constructor(
    private mapService: MapService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private platform: Platform,
    private router: Router,
    private store: Store<{ strapi: StrapiStateInterface }>,
  ) {
    if (this.platform.is('ios')) {
      this.plateformType = 'ios';
    } else if (this.platform.is('android')) {
      this.plateformType = 'md';
    } else {
      this.plateformType = 'web';
    }

    this.subPolygonId = this.mapService.polygonId.subscribe((value) => {
      this.polygonId = value;

      if (value) {
        this.showPolygonFromQuery();
      }
    });

    this.subPolygonName = this.mapService.polygonName.subscribe((value) => {
      this.map?.invalidateSize(true);
      this.polygonName = value;

      if (value) {
        this.showPolygonFromQuery();
      }
    });
  }

  public ngOnDestroy(): void {
    this.subPolygonId.unsubscribe();
    this.subPolygonName.unsubscribe();
  }

  async ngAfterViewInit() {
    setTimeout(() => {
      this.map?.invalidateSize(true);
    }, 100);
  }

  async ngOnInit(): Promise<void> {
    this.loadMap();
    this.map?.invalidateSize(true);
    this.store
      .select('strapi')
      .pipe(take(1))
      .subscribe((strapi) => {
        this.templateConfig = strapi.config.templateConfig;
        this.defaultLevel = strapi.config.appConfig.interactiveMap.defaultLevel;
        this.data = strapi.exhibitors.interactiveMap;
        this.checkDisabledLevel();
        this.removePolygons();
        this.addPolygons();
        this.showPolygonFromQuery();
        this.map?.invalidateSize(true);
      });
    this.defaultHref = this.route.snapshot.queryParamMap.get('routeBack') ?? '/app/tabs/exposants';
    this.showPolygonFromQuery();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchEnabled) {
      if (changes.searchEnabled.currentValue) {
        this.showFind();
      }
    }
  }

  public handleClickZoom(zoomInterval: number): void {
    this.map.zoomIn(zoomInterval);
  }

  public async showFind(): Promise<void> {
    const modal = await this.modalController.create({
      component: RoomFindModal,
      componentProps: {
        data: this.data,
      },
      initialBreakpoint: 0.66,
      breakpoints: [0, 0.33, 0, 66, 1],
      cssClass: 'modal-wrapper no-blur',
    });

    this.changeModal(modal);

    modal.onDidDismiss().then((dataReturn) => {
      this.modalClosed.emit();
      if (dataReturn.data) {
        this.handleLevel(null, dataReturn.data.level);
        this.handleCLickPolygon(dataReturn.data.location);
      }
    });

    return await modal.present();
  }

  public async showWhereAmI(): Promise<void> {
    const modal = await this.modalController.create({
      component: RoomWhereAmIModal,
      componentProps: {
        data: this.data,
      },
      initialBreakpoint: 0.66,
      breakpoints: [0, 0.33, 0, 66, 1],
      cssClass: 'modal-wrapper no-blur',
    });

    this.changeModal(modal);

    modal.onDidDismiss().then((dataReturn) => {
      this.modalClosed.emit();
      if (dataReturn.data) {
        this.handleLevel(null, dataReturn.data.level);
        this.handleCLickPolygon(dataReturn.data.location, false);
      }
    });

    return await modal.present();
  }

  public handleLevel(levelInterval: number | null, level: string | null = null): void {
    const levels = Object.keys(this.data)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => a - b);
    let index = Math.min(Math.max(levels.indexOf(this.level) + (levelInterval ?? 0), 0), levels.length - 1);
    if (level !== null) {
      index = Math.min(Math.max(levels.indexOf(parseInt(level, 10)), 0), levels.length - 1);
    }

    this.isDisabledLevelOut = index <= 0;
    this.isDisabledLevelIn = index >= levels.length - 1;

    if (this.level !== levels[index]) {
      this.map.removeLayer(this.mainLayer);
      this.level = levels[index] ?? this.defaultLevel;
      this.mainLayer = L.tileLayer(`/assets/map/${this.level}/tile_{z}_{x}_{y}.png`, { noWrap: true });
      this.removePolygons();
      this.map.addLayer(this.mainLayer);
      this.map.setZoom(1);
      this.map.invalidateSize(true);
      this.addPolygons();
    }
  }

  private loadMap(): void {
    this.map = L.map('map-exhibitors', {
      center: this.coordonates,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      zoom: this.zoom,
      maxBounds: [
        [-180, -180], //south west
        [180, 180], //north east
      ],
      maxBoundsViscosity: 1.0,
    });

    this.map.on('dragend', () => {
      this.centerChanged.emit(this.map.getCenter());
    });

    this.map.on('zoomend', () => {
      this.zoomChanged.emit(this.map.getZoom());
    });

    this.map?.attributionControl?.getContainer()?.remove();
    this.map?.zoomControl?.getContainer()?.remove();

    this.mainLayer = L.tileLayer(`/assets/map/${this.level}/tile_{z}_{x}_{y}.png`, { noWrap: true });
    this.map.addLayer(this.mainLayer);

    this.addPolygons();

    this.handleZoom();
    this.map.on('zoom', () => {
      if (this.timeoutZoom) {
        clearTimeout(this.timeoutZoom);
      }
      this.timeoutZoom = setTimeout(() => {
        this.handleZoom();
      }, 50);
    });

    this.showPolygonFromQuery();
  }

  private showPolygonFromQuery(): void {
    if (this.polygonName) {
      let polygonExhibitor;
      for (const level of Object.values(this.data)) {
        polygonExhibitor = level.find((exhib) => exhib.exhibitor.name === this.polygonName);

        if (polygonExhibitor) {
          break;
        }
      }

      if (polygonExhibitor) {
        this.polygonId = polygonExhibitor.exhibitor.id;
      }

      setTimeout(() => {
        this.mapService.polygonName.next(undefined);
      }, 0);
    }

    if (this.polygonId) {
      let level = null;
      let location: LeveledPolygons | LeveledCircles | LeveledMarkers | null = null;

      for (const [key, value] of Object.entries(this.data)) {
        location = value?.find((p) => p.exhibitor.id === this.polygonId) as LeveledPolygons | LeveledCircles | LeveledMarkers | null;
        if (location) {
          level = parseInt(key, 10);
          break;
        }
      }

      if ((!!level || level === 0) && location) {
        this.handleLevel(null, `${level}`);
        this.handleCLickPolygon(location);
      }

      setTimeout(() => {
        this.mapService.polygonId.next(undefined);
      }, 1000);
    }

    setTimeout(() => {
      this.map?.invalidateSize(true);
    }, 500);
  }

  private handleZoom(): void {
    const zoom = Math.trunc(this.map.getZoom());

    this.isDisabledZoomOut = zoom <= this.minZoom;
    this.isDisabledZoomIn = zoom >= this.maxZoom;
  }

  private checkDisabledLevel(): void {
    const levels = Object.keys(this.data)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => a - b);
    const index = Math.min(Math.max(levels.indexOf(this.level), 0), levels.length - 1);

    this.isDisabledLevelOut = index <= 0;
    this.isDisabledLevelIn = index >= levels.length - 1;
  }

  private addPolygons(): void {
    this.levelPolygons = [];
    const polygonsInLevel = this.data[this.level];

    if (this.map) {
      polygonsInLevel?.forEach((p) => {
        if (p.type === 'circle') {
          const circle = L.circle(p.latlng ?? new L.LatLng(0, 0), p.radius ?? 0, {
            color: this.templateConfig.colorCongressTer,
            className: `pulsation do-fade-${p.exhibitor?.id}`,
          }) as LeveledCircles;
          circle.mapId = p.exhibitor?.id;
          circle.defaultColor = p.defaultColor;
          circle.addTo(this.map);
          circle.on('click', () => this.handleCLickPolygon(p as LeveledCircles));
          this.levelPolygons.push(circle);
        } else if (p.type === 'marker') {
          const marker = L.marker(
            p.latlng ?? new L.LatLng(0, 0) /* {
            color: this.isDrawMode ? 'red' : p.defaultColor ?? 'transparent',
            className: `do-fade-${p.exhibitor.id}`,
          } */
          ) as LeveledMarkers;
          marker.mapId = p.exhibitor?.id;
          marker.defaultColor = p.defaultColor;
          marker.addTo(this.map);
          marker.on('click', () => this.handleCLickPolygon(p as LeveledMarkers));
          this.levelPolygons.push(marker);
        } else {
          const polygon: LeveledPolygons = L.polygon(p.coordinates ?? [], {
            color: this.templateConfig.colorCongressTer,
            className: `pulsation do-fade-${p.exhibitor?.id}`,
          }) as LeveledPolygons;
          polygon.mapId = p.exhibitor?.id;
          polygon.defaultColor = p.defaultColor;
          polygon.addTo(this.map);
          polygon.on('click', () => this.handleCLickPolygon(p as LeveledPolygons));
          this.levelPolygons.push(polygon);
        }
      });
    }
  }

  private removePolygons(): void {
    for (const p of this.levelPolygons) {
      p.off('click', () => this.handleCLickPolygon(p));
      p.removeFrom(this.map);
    }

    this.levelPolygons = [];
  }

  private handleCLickPolygon(polygon: LeveledPolygons | LeveledCircles | LeveledMarkers, showInfo = true): void {
    if (this.canCLick) {
      this.canCLick = false;
      setTimeout(() => {
        this.canCLick = true;
      }, 50);

      for (const levelPolygon of this.levelPolygons) {
        if (levelPolygon.type !== 'marker') {
          levelPolygon.setStyle({
            color: levelPolygon.defaultColor ?? 'transparent',
          });
          const el = document.querySelector(`path.do-fade-${levelPolygon.mapId}`) as HTMLElement;

          el?.classList.remove('do-fade');
          el?.classList.remove('pulsation');

          if (polygon?.exhibitor?.id === levelPolygon.mapId) {
            levelPolygon.setStyle({ color: polygon.color });
            setTimeout(() => {
              el?.classList.add('do-fade');
              this.map.setView(levelPolygon.getBounds().getCenter(), 2);
            }, 50);
          }
        } else {
          const el = document.querySelector(`path.do-fade-${levelPolygon.mapId}`) as HTMLElement;
          el?.classList.remove('do-fade');

          if (polygon?.exhibitor?.id === levelPolygon.mapId) {
            setTimeout(() => {
              el.classList.add('do-fade');
              this.map.setView(levelPolygon.getLatLng(), 2);
            }, 50);
          }
        }
      }
      if (showInfo) {
        this.showRoomInfo(polygon);
      }
    }
  }

  private async showRoomInfo(room: LeveledPolygons | LeveledCircles | LeveledMarkers): Promise<void> {
    const modal = await this.modalController.create({
      component: RoomDetailModal,
      componentProps: {
        room,
      },
      initialBreakpoint: 0.33,
      breakpoints: [0, 0.33, 0, 66, 1],
      cssClass: 'modal-wrapper no-blur',
    });

    this.changeModal(modal);

    modal.onDidDismiss().then((dataReturn) => {
      this.modalClosed.emit();
      if (dataReturn.data && dataReturn.data.url) {
        this.router.navigateByUrl(dataReturn.data.url);
      }
    });

    return await modal.present();
  }

  private changeModal(modal: HTMLIonModalElement): void {
    if (this.actualModal) {
      this.actualModal.dismiss();
    }
    this.actualModal = modal;
  }
}
