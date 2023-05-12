/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { /* LoadingController, */ ModalController } from '@ionic/angular';
import { RoomDetailModal } from 'src/app/shared/modals/interactive-map/room-detail/room-detail.modal';
import { RoomFindModal } from 'src/app/shared/modals/interactive-map/room-find/room-find.modal';
import { RoomWhereAmIModal } from 'src/app/shared/modals/interactive-map/room-where-am-i/room-where-am-i.modal';

import * as L from 'leaflet';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { InteractiveMap, LeveledCircles, LeveledMarkers, LeveledPolygons } from 'src/app/core/models/interactive-map.interface';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-interactive-global-map',
  templateUrl: './interactive-global-map.page.html',
  styleUrls: ['./interactive-global-map.page.scss'],
})
export class InteractiveGlobalMapPage implements OnInit, OnDestroy {
  public defaultHref = '';
  public defaultLevel: number;
  public level = 0;
  public isDisabledZoomOut = false;
  public isDisabledZoomIn = false;
  public isDisabledLevelOut = false;
  public isDisabledLevelIn = false;
  public data: InteractiveMap = {};
  public objectKeys = Object.keys;

  private actualModal: HTMLIonModalElement;
  private isDrawMode = false;
  private canCLick = true;
  private timeoutZoom: ReturnType<typeof setTimeout> | null = null;
  // private loading: HTMLIonLoadingElement;
  private levelPolygons: (LeveledPolygons | LeveledCircles | LeveledMarkers)[] = [];
  private mainLayer: L.TileLayer;
  private map: L.Map;
  private minZoom = 0;
  private maxZoom = 4;

  private defaultZoom = 1;

  constructor(
    private modalController: ModalController,
    private route: ActivatedRoute,
    private store: Store<{ strapi: StrapiStateInterface }>
  ) // private loadingController: LoadingController
  {}

  public ngOnInit(): void {
    this.isDrawMode = !!this.route.snapshot.queryParams.draw;
    this.loadMap();
    this.map.invalidateSize(true);
  }

  public ngOnDestroy(): void {
    this.map.remove();
  }

  public async ionViewWillEnter(): Promise<void> {
    this.store
      .select('strapi')
      .pipe(take(1))
      .subscribe((/* strapi */) => {
        this.defaultLevel = 0;
        // this.data = strapi.interactiveMap;
        this.data = {
          0: [],
          1: [],
          2: [],
          3: [],
        };
        this.checkDisabledLevel();
        this.removePolygons();
        this.addPolygons();
        this.showPolygonFromQuery();
        this.map?.invalidateSize(true);
        // this.loading.dismiss();
      });
    // this.loading = await this.loadingController.create({
    //   cssClass: 'loading-transparent',
    // });
    // this.loading.present();

    this.defaultHref = this.route.snapshot.queryParamMap.get('routeBack') ?? '/app/tabs/exposants';

    this.showPolygonFromQuery();
  }

  public handleClickZoom(zoomInterval: number): void {
    this.map.zoomIn(zoomInterval);
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
      this.mainLayer = L.tileLayer(`/assets/global-map/${this.level}/tile_{z}_{x}_{y}.png`, { noWrap: true });
      this.removePolygons();
      this.map.addLayer(this.mainLayer);
      this.map.setZoom(this.defaultZoom);
      this.map.invalidateSize(true);
      this.addPolygons();
    }
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
      if (dataReturn.data) {
        this.handleLevel(null, dataReturn.data.level);
        this.handleCLickPolygon(dataReturn.data.location, false);
      }
    });

    return await modal.present();
  }

  private loadMap(): void {
    this.map = L.map('map-global', {
      center: [0, 0],
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      zoom: this.defaultZoom,
      maxBounds: [
        [-180, -180], //south west
        [180, 180], //north east
      ],
      maxBoundsViscosity: 1.0,
    });

    this.map?.attributionControl?.getContainer()?.remove();
    this.map?.zoomControl?.getContainer()?.remove();

    this.mainLayer = L.tileLayer(`/assets/global-map/${this.level}/tile_{z}_{x}_{y}.png`, { noWrap: true });
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
    const polygonIdParam = this.route.snapshot.queryParams.polygonId;
    if (polygonIdParam) {
      let level = null;
      let location: LeveledPolygons | LeveledCircles | LeveledMarkers | null = null;

      for (const [key, value] of Object.entries(this.data)) {
        location = value?.find((p) => `${p.exhibitor.id}` === polygonIdParam) as LeveledPolygons | LeveledCircles | LeveledMarkers | null;
        if (location) {
          level = parseInt(key, 10);
          break;
        }
      }

      if ((!!level || level === 0) && location) {
        this.handleLevel(null, `${level}`);
        this.handleCLickPolygon(location);
      }
    }
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
            color: this.isDrawMode ? 'red' : p.defaultColor ?? 'transparent',
            className: `do-fade-${p.exhibitor?.id}`,
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
            color: this.isDrawMode ? 'red' : p.defaultColor ?? 'transparent',
            className: `do-fade-${p.exhibitor?.id}`,
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

          el.classList.remove('do-fade');

          if (polygon?.exhibitor?.id === levelPolygon.mapId) {
            levelPolygon.setStyle({ color: polygon.color });
            setTimeout(() => {
              el.classList.add('do-fade');
              this.map.setView(levelPolygon.getBounds().getCenter(), this.defaultZoom);
            }, 50);
          }
        } else {
          const el = document.querySelector(`path.do-fade-${levelPolygon.mapId}`) as HTMLElement;
          el.classList.remove('do-fade');

          if (polygon?.exhibitor?.id === levelPolygon.mapId) {
            setTimeout(() => {
              el.classList.add('do-fade');
              this.map.setView(levelPolygon.getLatLng(), this.defaultZoom);
            }, 50);
          }
        }
      }
      if (showInfo) {
        this.showRoomInfo(polygon);
      }
    }
  }

  private changeModal(modal: HTMLIonModalElement): void {
    if (this.actualModal) {
      this.actualModal.dismiss();
    }
    this.actualModal = modal;
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

    return await modal.present();
  }
}
