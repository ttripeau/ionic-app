import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';
import { IntroductionGuard } from 'src/app/core/guards/introduction.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'splash',
        children: [
          {
            path: '',
            loadChildren: () => import('../splash/splash.module').then((m) => m.SplashPageModule),
          },
        ],
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then((m) => m.HomeModule),
            canActivate: [IntroductionGuard],
          },
        ],
      },

      {
        path: 'interactive-global-map',
        children: [
          {
            path: '',
            loadChildren: () => import('../interactive-global-map/interactive-global-map.module').then((m) => m.InteractiveGlobalMapPageModule),
          },
        ],
      },
      {
        path: 'programme',
        children: [
          {
            path: '',
            loadChildren: () => import('../schedule/schedule.module').then((m) => m.ScheduleModule),
          },
          {
            path: 'session/:dayId/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then((m) => m.SessionDetailModule),
          },
          {
            path: 'training',
            loadChildren: () => import('../schedule-training/schedule-training.module').then((m) => m.ScheduleTrainingPageModule),
          },
        ],
      },
      {
        path: 'mes-sessions',
        loadChildren: () => import('../mes-sessions/mes-sessions.module').then((m) => m.MesSessionsPageModule),
      },
      {
        path: 'speakers',
        children: [
          {
            path: '',
            loadChildren: () => import('../speakers/speakers.module').then((m) => m.SpeakersModule),
          },
          {
            path: 'speaker-details/:speakerId',
            loadChildren: () => import('../speaker-detail/speaker-detail.module').then((m) => m.SpeakerDetailModule),
          },
        ],
      },
      {
        path: 'exposants',
        children: [
          {
            path: '',
            loadChildren: () => import('../exposants/exposants.module').then((m) => m.ExposantsPageModule),
          },
          {
            path: 'exposant-details/:exposantId',
            loadChildren: () => import('../exposant-detail/exposant-detail.module').then((m) => m.ExposantDetailModule),
          },
        ],
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: () => import('../about/about.module').then((m) => m.AboutModule),
          },
        ],
      },
      {
        path: 'aproposde',
        children: [
          {
            path: '',
            loadChildren: () => import('../aproposde/aproposde.module').then((m) => m.AproposdePageModule),
          },
        ],
      },
      {
        path: '',
        redirectTo: '/app/tabs/splash',
        pathMatch: 'full',
      },
      {
        path: 'speakers',
        loadChildren: () => import('../speakers/speakers.module').then((m) => m.SpeakersModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
