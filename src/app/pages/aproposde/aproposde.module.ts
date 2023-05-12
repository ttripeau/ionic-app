import { NgModule } from '@angular/core';

import { AproposdePage } from './aproposde';
import { AproposdePageRoutingModule } from './aproposde-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AproposdePageRoutingModule,
  ],
  declarations: [AproposdePage],
  bootstrap: [AproposdePage],
})
export class AproposdePageModule {}
