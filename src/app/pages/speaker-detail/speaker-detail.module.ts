import { NgModule } from '@angular/core';

import { SpeakerDetailPage } from './speaker-detail';
import { SpeakerDetailPageRoutingModule } from './speaker-detail-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SpeakerDetailPageRoutingModule, SharedModule],
  declarations: [SpeakerDetailPage],
})
export class SpeakerDetailModule {}
