/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';
import { InteractiveMap } from 'src/app/core/models/interactive-map.interface';

@Component({
  selector: 'app-room-find',
  templateUrl: './room-find.modal.html',
  styleUrls: ['./room-find.modal.scss'],
})
export class RoomFindModal {
  @Input() data: InteractiveMap;

  public items: { level: string; location: any }[] | null = null;

  constructor(private modalController: ModalController, public translate: TranslateService) {}

  public async closeModal(): Promise<void> {
    await this.modalController.dismiss();
  }

  public async selectItem(item: any): Promise<void> {
    await this.modalController.dismiss(item);
  }

  public getItems(event: any): void {
    const searchValue = event.target.value;

    // if the value is an empty string don't filter the items
    if (searchValue && searchValue.trim() !== '') {
      const newItems = [];
      for (const level in this.data) {
        if (this.data[level]) {
          const locations = this.data[level];
          for (const location of locations) {
            if (location.exhibitor.name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0) {
              newItems.push({
                level,
                location,
              });
            }
          }
        }
      }

      this.items = newItems;
    } else {
      this.items = null;
    }
  }
}
