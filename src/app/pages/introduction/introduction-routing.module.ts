import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { IntroductionPage } from './introduction.page';

const routes: Routes = [
  {
    path: '',
    component: IntroductionPage,
    canActivate: [StatusBarGuard],
    data: {
      statusColor: 'congress',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntroductionPageRoutingModule {}
