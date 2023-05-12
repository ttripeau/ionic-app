import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class IntroductionGuard implements CanActivate {
  constructor(private storage: Storage, private router: Router) {}

  async canActivate() {
    const introductionExist: null | boolean = await this.storage.get('introduction_accepted');
    if (introductionExist === null) {
      this.router.navigate(['introduction'], { replaceUrl: true });
      return false;
    } else {
      return true;
    }
  }
}
