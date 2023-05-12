import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { SplashPage } from './splash.page';

const routes: Routes = [
  {
    path: '',
    component: SplashPage,
    canActivate: [StatusBarGuard],
    data: {
      statusColor: 'splash',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplashPageRoutingModule {}
