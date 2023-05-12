import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { filter, pairwise } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PreviousRouteService {
  private previousUrl: string | null;
  private currentUrl: string;
  private readonly excludeRoutes = ['/', '/app/tabs', '/app/tabs/splash', '/login', '/introduction', '/cgu', '/need-update-version'];

  private history: string[] = ['/app/tabs/home'];
  private hasBack: boolean = false;

  constructor(private router: Router, private platform: Platform, private navController: NavController) {
    this.currentUrl = this.router.url;
    this.previousUrl = null;

    this.router.events
      .pipe(
        filter((event: any) => event instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
        this.currentUrl = events[1].urlAfterRedirects;
        if (!this.hasBack && !this.excludeRoutes.includes(this.previousUrl) && !this.excludeRoutes.includes(this.currentUrl)) {
          this.history.push(events[0].urlAfterRedirects);
        }
        this.hasBack = false;
      });

    this.platform.backButton.subscribeWithPriority(-1, () => {
      this.back();
    });
  }

  public getPreviousUrl() {
    return this.previousUrl;
  }

  public getCurrentUrl() {
    return this.currentUrl;
  }

  back(): void {
    this.hasBack = true;
    if (this.history.length > 0) {
      const last = this.history.pop();
      this.navController.navigateBack(last ?? '', { replaceUrl: true });
    } else {
      console.log('this.location: exit');
      this.router.navigate(['/app/tabs/home'], { replaceUrl: true });
    }
  }
}
