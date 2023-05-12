/* eslint-disable @typescript-eslint/no-unused-vars */
import { FavoriteSessionDay, Schedule } from '../models/schedule.interface';
import { Session } from '../models/session.interface';
import { MyProgramService } from '../services/my-program.service';

export const removeFavorite = (
  myProgramme: MyProgramService,
  sessionsToShow: FavoriteSessionDay[],
  session: Session,
  indexSessionToShow: number,
  indexSessionToShowSessions: number,
  _listFavorites: Session[]
) => {
  myProgramme.removeFavorite(session).then((data) => {
    _listFavorites = data;
    sessionsToShow[indexSessionToShow].sessions[indexSessionToShowSessions].isfavorite = false;
  });
};

export const addFavorite = (
  myProgramme: MyProgramService,
  sessionsToShow: Schedule['groups'],
  session: Session,
  indexSessionToShow: number,
  indexSessionToShowSessions: number,
  _listFavorites: Session[]
) => {
  myProgramme.addFavorite(session).then((data) => {
    _listFavorites = data;
    sessionsToShow[indexSessionToShow].sessions[indexSessionToShowSessions].isfavorite = true;
  });
};

export const encodeTrack = (value: string): string => {
  if (!value) {
    return '';
  }

  return value.replace(/[^a-zA-Z]/g, '');
};
