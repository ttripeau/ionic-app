import { NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

// Reducers
import { strapiReducer, StrapiStateInterface } from './store/reducers/strapi.reducer';
import { FavoriteSessionInterface, favoriteSessionsReducer } from './store/reducers/my-program.reducer';

export interface AppStoreState {
  strapi: StrapiStateInterface;
  favoriteSessions: FavoriteSessionInterface[];
}

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    StoreModule.forRoot({
      strapi: strapiReducer as ActionReducer<StrapiStateInterface, Action>,
      favoriteSessions: favoriteSessionsReducer as ActionReducer<FavoriteSessionInterface[], Action>,
    }),
  ],
  exports: [BrowserModule, HttpClientModule],
})
export class CoreModule {}
