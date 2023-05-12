import { createAction, props } from '@ngrx/store';
import { FavoriteSessionInterface } from '../reducers/my-program.reducer';

export const setFavoriteSessions = createAction(
  '[Congress favoriteSession] setFavoriteSessions',
  props<{favoriteSessions: FavoriteSessionInterface[]}>()
);

