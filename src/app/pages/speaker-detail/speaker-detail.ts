import { Component, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Speaker } from 'src/app/core/models/speaker.interface';
import { TemplateConfig } from 'src/app/core/models/config.interface';
import { ContactDetailComponentInterface } from 'src/app/shared/components/contact-detail/contact-detail.component';
import { PhotoViewerService } from 'src/app/core/services/photo-viewer.service';
import { DomSanitizer } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';
import { AppStoreState } from 'src/app/core/core.module';
import { Session } from 'src/app/core/models/session.interface';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Intervention } from 'src/app/core/models/intervention.interface';

@Component({
  selector: 'app-page-speaker-detail',
  templateUrl: 'speaker-detail.html',
  styleUrls: ['./speaker-detail.scss'],
})
export class SpeakerDetailPage {
  public speaker: Speaker | null = null;
  public defaultHref = '';
  public templateConfig: TemplateConfig;
  public details: ContactDetailComponentInterface[] = [];
  public hasGoToChat: boolean = false;

  private sessionTrainingStorage: Schedule[] = [];
  private scheduleScientificStorage: Schedule[] = [];
  private scheduleVodStorage: Session[] = [];
  private speakers: Speaker[] = [];
  private chatStatus?: {
    reference: string;
    name: string;
  } = undefined;

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppStoreState>,
    private photoViewerService: PhotoViewerService,
    public sanitizer: DomSanitizer,
    private router: Router,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.sessionTrainingStorage = strapi.programme.schedule.training;
      this.scheduleScientificStorage = strapi.programme.schedule.scientific;
      this.scheduleVodStorage = strapi.programme.schedule.vod;
      this.templateConfig = strapi.config.templateConfig;
      this.speakers = strapi.programme.speakers;
      this.initSpeakers();
    });
  }

  public async initSpeakers(): Promise<void> {
    const speakerId = this.route.snapshot.paramMap.get('speakerId');

    for (const speaker of this.speakers) {
      if (speaker && parseInt(speaker.idSpeaker, 10) === parseInt(speakerId ?? '', 10)) {
        this.speaker = cloneDeep(speaker);

        this.speaker.interventions = this.speaker.interventions.filter((intervention) => !intervention.hidden);
        this.speaker.interventions = this.speaker.interventions.map(interv => this.getIntervention(interv));
        this.details = this.getDetails();
        break;
      }
    }
  }

  public ionViewWillEnter(): void {
    this.defaultHref = this.route.snapshot.queryParamMap.get('routeBack') ?? '';
  }

  public getDetails(): ContactDetailComponentInterface[] {
    return [
      {
        show: this.speaker && this.speaker?.institute,
        // detail: `${this.speaker?.department ? `<span>${this.speaker?.department}<br/></span>` : ''}<span><b>${this.speaker?.institute}</b></span>`,
        detail: `<span><b>${this.speaker?.institute}</b></span>`,
        icon: 'business-outline',
        color: 'congressultralight',
      },
      {
        show: this.speaker && (this.speaker?.town || this.speaker?.country),
        detail: this.speaker ? this.speaker.town + ' ' + (this.speaker.country ? '(<b>' + this.speaker.country + '</b>)' : '') : null,
        icon: 'earth-outline',
        color: 'congressultralight',
      },
    ];
  }

  public formatBiography(val?: string) {
    if (val) {
      return this.sanitizer.sanitize(SecurityContext.HTML, val);
    }
    return '';
  }

  public async showPictureFullScreen(url?: string): Promise<void> {
    if (url) {
      await this.photoViewerService.show(url, '');
    }
  }

  public goToChat(): void {
    if (this.chatStatus) {
      this.router.navigate([`/app/tabs/chat/${this.chatStatus.reference}/${this.chatStatus.name.replace('_', ' ')}`]);
    }
  }

  public getSession(idSession: string): Session {
    let tempSession: Session | undefined;

    if (!tempSession) {
      for (const day of this.scheduleScientificStorage) {
        for (const oneGroup of day.groups) {
          for (const oneSession of oneGroup.sessions) {
            if (oneSession && oneSession.idSession === parseInt(idSession ?? '', 10)) {
              tempSession = oneSession;
              break;
            }
          }
        }
      }
    }

    if (!tempSession) {
      for (const day of this.sessionTrainingStorage) {
        for (const oneGroup of day.groups) {
          for (const oneSession of oneGroup.sessions) {
            if (oneSession && oneSession.idSession === parseInt(idSession ?? '', 10)) {
              tempSession = oneSession;
              break;
            }
          }
        }
      }
    }

    if (!tempSession) {
      if (this.scheduleVodStorage.length > 0) {
        for (const session of this.scheduleVodStorage) {
          if (session && session.idSession === parseInt(idSession ?? '', 10)) {
            tempSession = session;
            break;
          }
        }
      }
    }

    return tempSession as Session;
  }

  public getIntervention(intervention: Intervention): Intervention {
    intervention.time  = this.getSession(intervention.idSession).timeBegin ?? intervention.time;

    return intervention;
  }
}
