import { HttpClient } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SQLiteService } from '../app/core/services/sqlite.service';
import { BrowserModule } from '@angular/platform-browser';
import { InitializeAppService } from './core/services/initialize.app.service';

// AOT compilation support
export const httpTranslateLoader = (http: HttpClient) => new TranslateHttpLoader(http);

export const initializeFactory = (init: InitializeAppService) => async () => await init.initializeApp();

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot({
      name: 'app_smartphone',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    InitializeAppService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLiteService,
    { provide: APP_INITIALIZER, useFactory: initializeFactory, deps: [InitializeAppService], multi: true },
  ],
  bootstrap: [AppComponent],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
