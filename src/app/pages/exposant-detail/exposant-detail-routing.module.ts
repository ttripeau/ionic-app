import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { ExposantDetailPage } from './exposant-detail';

const routes: Routes = [
  {
    path: '',
    component: ExposantDetailPage,
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
export class ExposantDetailPageRoutingModule {}
