import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';

import { AproposdePage } from './aproposde';

const routes: Routes = [
  {
    path: '',
    component: AproposdePage,
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
export class AproposdePageRoutingModule { }
