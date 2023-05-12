/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnChanges } from '@angular/core';
import { Session } from 'src/app/core/models/session.interface';
import { Store } from '@ngrx/store';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { encodeTrack } from 'src/app/core/utils/session-item.utils';
import { Intervention } from 'src/app/core/models/intervention.interface';
import { Society } from 'src/app/core/models/society.interface';
import { Sponsor } from 'src/app/core/models/sponsor.interface';
import { Type } from 'src/app/core/models/type.interface';
import { MyProgramService } from 'src/app/core/services/my-program.service';
import { FavoriteSessionInterface } from 'src/app/core/store/reducers/my-program.reducer';
import { AppStoreState } from 'src/app/core/core.module';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Speaker } from 'src/app/core/models/speaker.interface';
import { Router } from '@angular/router';

export interface ExtendedIntervention extends Intervention {
  session?: Session;
}

@Component({
  selector: 'app-session-item-intervention',
  templateUrl: './session-item-intervention.component.html',
  styleUrls: [],
})
export class SessionItemInterventionComponent implements OnChanges {
  @Input() intervention: Intervention;
  @Input() session: Session;
  @Input() link: string | null = null;
  @Input() linkQueryParams: { [key: string]: string } = {};
  @Input() border: boolean = true;
  @Input() showTime: boolean = true;
  @Input() hasFavorite: boolean = false;

  public templateConfig: TemplateConfig;
  public isOpen = false;
  public interventionToShow: ExtendedIntervention;

  private listFavorites: FavoriteSessionInterface[] = [];
  private scientificProgramme: Schedule[];
  private trainingProgramme: Schedule[];
  private vodProgramme: Session[];

  constructor(private store: Store<AppStoreState>, private myProgramService: MyProgramService, private router: Router) {
    this.store.select('strapi').subscribe((strapi) => {
      this.templateConfig = strapi.config.templateConfig;
      this.scientificProgramme = strapi.programme.schedule.scientific;
      this.trainingProgramme = strapi.programme.schedule.training;
      this.vodProgramme = strapi.programme.schedule.vod;
      this.initInterventionToShow();
    });

    this.store.select('favoriteSessions').subscribe((favoriteSessions) => {
      this.listFavorites = favoriteSessions?.filter((f: Session) => !!f) ? favoriteSessions?.filter((f: Session) => !!f) : [];
      this.initInterventionToShow();
    });
  }

  public ngOnChanges(): void {
    this.initInterventionToShow();
  }

  public encodeTrack(value?: Type): string {
    if (value) {
      return encodeTrack(value.title);
    }

    return '';
  }

  public encodeTheme(value?: Society[]): string {
    if (value?.[0]?.name) {
      return encodeTrack(value[0].name);
    }

    return '';
  }

  public getSpeakerPhoto(idSpeaker: string): string {
    const value = this.session.speakers.find((s) => s.idSpeaker === idSpeaker);
    const photo = value && value?.picture !== '' ? value?.picture : 'assets/img/user.png';

    return photo;
  }

  public getInlineSponsors(sponsors: Sponsor[]): string {
    return sponsors.map((s) => s.title).join(', ');
  }

  public getIcon(): { src?: string; name?: string } {
    const type = this.intervention.typeSession;

    return {
      src:
        type.toLowerCase() === 'Learning'.toLowerCase() || type.toLowerCase() === 'LIVE Case'.toLowerCase()
          ? type.toLowerCase() === 'Learning'.toLowerCase()
            ? 'assets/icon/icon_learning.svg'
            : 'assets/icon/icon_live.svg'
          : 'assets/icon/icon_type.svg',
      name: undefined,
    };
  }

  public async removeFavorite(): Promise<void> {
    if (this.interventionToShow.session) {
      try {
        await this.myProgramService.removeFavorite(this.interventionToShow.session);
      } catch (error) {
        console.log(error);
      }
    }
  }

  public async addFavorite(): Promise<void> {
    if (this.interventionToShow.session) {
      try {
        await this.myProgramService.addFavorite(this.interventionToShow.session);
      } catch (error) {
        console.log(error);
      }
    }
  }

  public openSpeaker(speaker: Speaker): void {
    if (speaker) {
      this.router.navigate([`/app/tabs/speakers/speaker-details/${speaker.idSpeaker}`]);
    }
  }

  private initInterventionToShow() {
    const session = this.getSession(this.intervention);
    if (!session) {
      this.interventionToShow = {
        ...this.intervention,
        session: undefined,
      };
      return;
    }

    this.interventionToShow = {
      ...this.intervention,
      session: {
        ...session,
        isfavorite: this.isFavorite(session),
      },
    };
  }

  private getSession(intervention: Intervention): Session | undefined {
    if (!intervention) {
      return undefined;
    }
    let foundSession = {};

    for (const day of this.scientificProgramme) {
      for (const group of day.groups) {
        for (const session of group.sessions) {
          if (parseInt(`${session?.idSession}`, 10) === parseInt(`${intervention?.idSession}`, 10)) {
            foundSession = session;
          }
        }
      }
    }

    if (!foundSession) {
      for (const day of this.trainingProgramme) {
        for (const group of day.groups) {
          for (const session of group.sessions) {
            if (parseInt(`${session?.idSession}`, 10) === parseInt(`${intervention?.idSession}`, 10)) {
              foundSession = session;
            }
          }
        }
      }
    }

    if (!foundSession) {
      for (const session of this.vodProgramme) {
        if (parseInt(`${session?.idSession}`, 10) === parseInt(`${intervention?.idSession}`, 10)) {
          foundSession = session;
        }
      }
    }

    return foundSession as Session;
  }

  private isFavorite(session: Session): boolean {
    return !!this.listFavorites.find((fav) => fav.idSession === session.idSession);
  }
}
