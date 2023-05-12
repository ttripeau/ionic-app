import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { HomePageRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [SharedModule, HomePageRoutingModule],
  declarations: [HomePage],
  bootstrap: [HomePage],
})
export class HomeModule {}
