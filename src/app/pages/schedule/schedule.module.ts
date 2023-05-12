import { NgModule } from '@angular/core';

import { SchedulePage } from './schedule';
import { SchedulePageRoutingModule } from './schedule-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SchedulePageRoutingModule, SharedModule],
  declarations: [SchedulePage],
})
export class ScheduleModule {}
