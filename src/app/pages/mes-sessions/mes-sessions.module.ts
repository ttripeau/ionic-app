import { NgModule } from '@angular/core';

import { MesSessionsPageRoutingModule } from './mes-sessions-routing.module';

import { MesSessionsPage } from './mes-sessions.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [MesSessionsPageRoutingModule, SharedModule],
  declarations: [MesSessionsPage],
})
export class MesSessionsPageModule {}
