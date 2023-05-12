import { NgModule } from '@angular/core';

import { ExposantsPageRoutingModule } from './exposants-routing.module';
import { ExposantsPage } from './exposants.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule, ExposantsPageRoutingModule],
  declarations: [ExposantsPage],
})
export class ExposantsPageModule {}
