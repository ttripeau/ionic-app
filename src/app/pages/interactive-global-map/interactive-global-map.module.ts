import { NgModule } from '@angular/core';

import { InteractiveGlobalMapPageRoutingModule } from './interactive-global-map-routing.module';

import { InteractiveGlobalMapPage } from './interactive-global-map.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule, InteractiveGlobalMapPageRoutingModule],
  declarations: [InteractiveGlobalMapPage],
})
export class InteractiveGlobalMapPageModule {}
