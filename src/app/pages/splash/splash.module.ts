import { NgModule } from '@angular/core';

import { SplashPageRoutingModule } from './splash-routing.module';

import { SplashPage } from './splash.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SplashPageRoutingModule, SharedModule],
  declarations: [SplashPage],
})
export class SplashPageModule {}
