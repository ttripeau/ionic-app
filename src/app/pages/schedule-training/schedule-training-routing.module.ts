import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { ScheduleTrainingPage } from './schedule-training.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduleTrainingPage,
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
export class ScheduleTrainingPageRoutingModule {}
