import { NgModule } from '@angular/core';
import { TabsPageRoutingModule } from './tabs-page-routing.module';

import { TabsPage } from './tabs-page';

import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [TabsPageRoutingModule, SharedModule],
  declarations: [TabsPage],
})
export class TabsModule {}
