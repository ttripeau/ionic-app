import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.modal.html',
  styleUrls: ['./add-note.modal.scss'],
})
export class AddNoteModal {
  @Input() data: { value: string; html: string | null } = { value: '', html: '' };
  @Input() isNew: boolean;

  constructor(private modalController: ModalController) {}

  public async closeModal(): Promise<void> {
    await this.modalController.dismiss(undefined);
  }

  public async valid(): Promise<void> {
    await this.modalController.dismiss(this.data);
  }

  public async deleteNote(): Promise<void> {
    this.data = { value: '', html: '' };
    await this.modalController.dismiss(this.data);
  }

  public updateValue(data: { value: string; html: string | null }): void {
    this.data = data;
  }
}
