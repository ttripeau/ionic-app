import { setFavoriteSessions } from '../actions/my-program.action';
import { Action, createReducer, on } from '@ngrx/store';

import { Session } from 'src/app/core/models/session.interface';

export type FavoriteSessionInterface = Session;

export const initialState: FavoriteSessionInterface[] = [];

const strapiReducerMap = createReducer(
  initialState,
  on(setFavoriteSessions, (_state, { favoriteSessions }) => favoriteSessions),
);

export const favoriteSessionsReducer = (state: FavoriteSessionInterface[], action: Action) => strapiReducerMap(state, action);
