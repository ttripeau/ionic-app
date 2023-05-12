import { Component } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from 'src/app/core/services/map.service';

@Component({
  selector: 'app-exposants',
  templateUrl: './exposants.page.html',
  styleUrls: ['./exposants.page.scss'],
})
export class ExposantsPage {
  public menuButtonColor: string = 'light';
  public view: 'PLAN' | 'LIST' = 'LIST';
  public searchEnabled: boolean = false;
  public coordonates: L.LatLng = L.latLng(0, 0, 2);
  public zoom: number = 1;

  constructor(private mapService: MapService) {
    this.mapService.polygonId.subscribe((value) => {
      if (value) {
        this.view = 'PLAN';
      }
    });
  }

  public ionViewWillEnter(): void {
    this.view = this.mapService.view.value;
    this.mapService.view.subscribe((value) => {
      this.view = value;
    });
  }

  public valueChanged(view: 'PLAN' | 'LIST'): void {
    this.view = view;
    this.mapService.view.next(view);
  }

  public search(): void {
    this.searchEnabled = !this.searchEnabled;
  }

  public modalClosed(): void {
    this.searchEnabled = false;
  }

  public centerChanged(coordonates: L.LatLng): void {
    this.coordonates = coordonates;
  }

  public zoomChanged(zoom: number): void {
    this.zoom = zoom;
  }
}
