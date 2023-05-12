import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Session } from 'src/app/core/models/session.interface';
import { Router } from '@angular/router';
import { AppStoreState } from 'src/app/core/core.module';
import { Store } from '@ngrx/store';
import { DateCongress } from 'src/app/core/models/config.interface';

@Component({
  selector: 'app-happening-now',
  templateUrl: './happening-now.modal.html',
  styleUrls: ['./happening-now.modal.scss'],
})
export class HappeningNowModal implements OnInit {
  @Input() sessions: Session[] = [];

  public interactivityRooms: DateCongress['interactivityRooms'] = [];

  constructor(
    private modalController: ModalController,
    private router: Router,
    private store: Store<AppStoreState>
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.interactivityRooms = strapi.config.dateCongress.interactivityRooms;
    });
  }

  public ngOnInit(): void {
    console.log(this.sessions);
  }

  public closeModal(): void {
    this.modalController.dismiss(undefined);
  }

  public goToSession(session: Session): void {
    this.router.navigate([`/app/tabs/programme/session/${session.idDate}/${session.idSession}`]);
    this.closeModal();
  }

  public showInteractive(session: Session): boolean {
    return !!this.interactivityRooms.find((room) => room.key === session.room);
  }

  public goToInteractivity(event: Event, session: Session) {
    event.stopPropagation();
    const keyRoom = this.interactivityRooms.find((room) => room.key === session.room);
    if (keyRoom) {
      this.router.navigate(['/app/tabs/interactivite-detail/' + keyRoom]);
    }
    this.closeModal();
  }
}
