import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StrapiStateInterface } from 'src/app/core/store/reducers/strapi.reducer';
import { Speaker } from 'src/app/core/models/speaker.interface';
import { AppConfig, DataConfig } from 'src/app/core/models/config.interface';

@Component({
  selector: 'app-page-speakers',
  templateUrl: 'speakers.html',
  styleUrls: ['./speakers.scss'],
})
export class SpeakersPage implements OnInit {
  public dataConfig: DataConfig;
  public speakersToShow: Speaker[];
  public pageNumber = 0;
  public defaultHref = '';
  public completeListeSpeakers: Speaker[] = [];
  public speakerPages = ['/app/tabs/home'];
  public isios = false;
  public isLoading = false;
  public pageConfig: AppConfig['speakersPage'];

  constructor(
    private route: Router,
    private platform: Platform,
    public loadingController: LoadingController,
    private store: Store<{ strapi: StrapiStateInterface }>,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.pageConfig = strapi.config.appConfig.speakersPage;
      this.init(strapi);
    });
  }

  public init(strapi: StrapiStateInterface): void {
    this.completeListeSpeakers = strapi.programme.speakers.filter((speaker) => !speaker.hidden);
    this.dataConfig = strapi.config.dataConfig;
    this.searchSpeaker();
  }

  ngOnInit() {
    this.isios = this.platform.is('ios');
  }

  backButton() {
    this.route.navigate(['/app/tabs/home']);
  }

  searchSpeaker() {
    this.speakersToShow = [];
    this.pageNumber = 0;
    this.getSpeakers(true, null);
  }

  async getSpeakers(isFirstLoad: boolean, event: InfiniteScrollCustomEvent | null) {
    this.isLoading = true;
    const speakersStorage = this.completeListeSpeakers;
    const queryText = this.dataConfig.queryText.speakers
      .toLowerCase()
      .replace(/,|\.|-/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const queryWords = queryText.split(' ').filter((w) => !!w.trim().length);
    let matchesQueryText = true;

    let j = 0;
    let i = 0;

    while (
      (j < 20 && speakersStorage[i + this.pageNumber * 20] && this.dataConfig.queryText.speakers === '') ||
      (this.dataConfig.queryText.speakers !== '' && speakersStorage[i + this.pageNumber * 20] && isFirstLoad)
    ) {
      if (!speakersStorage[i + this.pageNumber * 20] || !speakersStorage[i + this.pageNumber * 20].lastName) {
        if (event) {
          event.target?.complete();
        }
        break;
      }

      matchesQueryText = false;
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (
            speakersStorage[i + this.pageNumber * 20]?.firstName
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .indexOf(queryWord) > -1 ||
            speakersStorage[i + this.pageNumber * 20]?.lastName
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .indexOf(queryWord) > -1 ||
            // || (speakersStorage[(i+(this.pageNumber*20))]?.town?.toLowerCase().indexOf(queryWord) > -1)
            // || (speakersStorage[(i+(this.pageNumber*20))]?.country?.toLowerCase().indexOf(queryWord) > -1)
            speakersStorage[i + this.pageNumber * 20]?.institute
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .indexOf(queryWord) > -1
          ) {
            j++;
            matchesQueryText = true;
          }
        });
      } else {
        j++;
        matchesQueryText = true;
      }

      if (matchesQueryText) {
        this.speakersToShow.push(speakersStorage[i + this.pageNumber * 20]);
      }
      i++;
    }

    this.pageNumber++;

    if (!isFirstLoad) {
      if (event) {
        event.target?.complete();
      }
    }

    this.isLoading = false;
  }

  loadData(event: Event) {
    this.getSpeakers(false, event as InfiniteScrollCustomEvent);
  }

  goToSpeakerDetail(speaker: Speaker): void {
    this.route.navigate([`/app/tabs/speakers/speaker-details/${speaker.idSpeaker}`], {
      queryParams: {
        routeBack: '/app/tabs/speakers',
      },
    });
  }

  public getInitials(speaker: Speaker): string {
    if (!speaker) {
      return ' ';
    }

    return `${speaker.firstName?.charAt(0) ?? ''}${speaker.lastName?.charAt(0) ?? ''}`.toLocaleUpperCase();
  }
}
