import { NgModule } from '@angular/core';

import { AboutPage } from './about';
import { AboutPageRoutingModule } from './about-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AboutPageRoutingModule,
  ],
  declarations: [AboutPage],
  bootstrap: [AboutPage],
})
export class AboutModule {}
