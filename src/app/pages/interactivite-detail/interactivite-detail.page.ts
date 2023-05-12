import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { User } from 'src/app/core/models/user.interface';
import { UserDataService } from 'src/app/core/services/user-data.service';
import { Store } from '@ngrx/store';
import { AppStoreState } from 'src/app/core/core.module';

@Component({
  selector: 'app-interactivite-detail',
  templateUrl: './interactivite-detail.page.html',
  styleUrls: ['./interactivite-detail.page.scss'],
})
export class InteractiviteDetailPage implements OnInit {
  public eventslido: SafeResourceUrl;
  public userInfo: User|null = null;
  public link: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public userDataService: UserDataService,
    private store: Store<AppStoreState>,
  ) {
    this.store.select('strapi').subscribe((strapi) => {
      this.link = strapi.config.appConfig.links?.interactivity ??  '';
      // this.eventslido = this.sanitizer.bypassSecurityTrustResourceUrl(this.link);
    });
  }

   async ngOnInit(): Promise<void> {
    this.userInfo = await this.userDataService.getInformations();
    const eventSlidoParams = this.route.snapshot.paramMap.get('eventslido');

    const isLoggedIn = await this.userDataService.isLoggedIn();
    if (isLoggedIn) {
      if (this.userInfo?.prenom && this.userInfo?.nom) {
        this.eventslido = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://app.sli.do/event/${eventSlidoParams}?user_name=${this.userInfo?.prenom} ${this.userInfo?.nom} (on-site)`
        );
      } else {
        this.eventslido = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://app.sli.do/event/${eventSlidoParams}`
        );
      }
    } else {
      this.eventslido = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://app.sli.do/event/${eventSlidoParams}`
      );
    }
  }

  public onViewDidLeave() {
    this.eventslido = '';
  }

  public backButton(): void {
    this.router.navigate(['/app/tabs/home']);
  }
}
