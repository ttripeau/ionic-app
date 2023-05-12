import { NgModule } from '@angular/core';

import { SpeakersPage } from './speakers';
import { SpeakersPageRoutingModule } from './speakers-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SpeakersPageRoutingModule, SharedModule],
  declarations: [SpeakersPage],
})
export class SpeakersModule {}
