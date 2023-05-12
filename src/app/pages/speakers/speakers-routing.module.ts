import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusBarGuard } from 'src/app/core/guards/status-bar-guard.guard';
import { SpeakersPage } from './speakers';

const routes: Routes = [
  {
    path: '',
    component: SpeakersPage,
    canActivate: [StatusBarGuard],
    data: {
      statusColor: 'white',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeakersPageRoutingModule {}
