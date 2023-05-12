import { NgModule } from '@angular/core';

import { SessionDetailPage } from './session-detail';
import { SessionDetailPageRoutingModule } from './session-detail-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SessionDetailPageRoutingModule, SharedModule],
  declarations: [SessionDetailPage],
  providers: [],
})
export class SessionDetailModule {}
