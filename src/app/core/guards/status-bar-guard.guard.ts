import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { StatusBarService } from '../services/status-bar.service';

@Injectable({
  providedIn: 'root',
})
export class StatusBarGuard implements CanActivate {
  constructor(private statusBarService: StatusBarService) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    if (route.data?.statusColor) {
      this.statusBarService.setStatusFromGuard(route.data?.statusColor);
    }
    return true;
  }
}
