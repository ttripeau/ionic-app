import { NgModule } from '@angular/core';

import { IntroductionPageRoutingModule } from './introduction-routing.module';

import { IntroductionPage } from './introduction.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule, IntroductionPageRoutingModule],
  declarations: [IntroductionPage],
})
export class IntroductionPageModule {}
