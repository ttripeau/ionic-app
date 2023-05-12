import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { InteractiveGlobalMapPage } from './interactive-global-map.page';

const routes: Routes = [
  {
    path: '',
    component: InteractiveGlobalMapPage,
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
export class InteractiveGlobalMapPageRoutingModule {}
