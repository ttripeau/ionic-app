import { NgModule } from '@angular/core';

import { ScheduleTrainingPageRoutingModule } from './schedule-training-routing.module';

import { ScheduleTrainingPage } from './schedule-training.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [ScheduleTrainingPageRoutingModule, SharedModule],
  declarations: [ScheduleTrainingPage],
})
export class ScheduleTrainingPageModule {}
