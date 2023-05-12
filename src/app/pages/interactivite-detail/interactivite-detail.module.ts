import { NgModule } from '@angular/core';

import { InteractiviteDetailPageRoutingModule } from './interactivite-detail-routing.module';

import { InteractiviteDetailPage } from './interactivite-detail.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    InteractiviteDetailPageRoutingModule,
  ],
  declarations: [InteractiviteDetailPage],
})
export class InteractiviteDetailPageModule {}
