import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { InteractiviteDetailPage } from './interactivite-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InteractiviteDetailPage,
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
export class InteractiviteDetailPageRoutingModule {}
