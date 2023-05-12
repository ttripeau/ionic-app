import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { HomePage } from './home';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
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
export class HomePageRoutingModule {}
