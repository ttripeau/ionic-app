import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { AboutPage } from './about';

const routes: Routes = [
  {
    path: '',
    component: AboutPage,
    canActivate: [StatusBarGuard],
    data: {
      statusColor: 'congress',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutPageRoutingModule { }
