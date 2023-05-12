import { NgModule } from '@angular/core';

import { ExposantDetailPage } from './exposant-detail';
import { ExposantDetailPageRoutingModule } from './exposant-detail-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule, ExposantDetailPageRoutingModule],
  declarations: [ExposantDetailPage],
})
export class ExposantDetailModule {}
