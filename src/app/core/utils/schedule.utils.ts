/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from 'lodash';
import { FilterSelectedInterface } from 'src/app/pages/schedule/schedule';
import { DateCongress } from '../models/config.interface';
import { FavoriteSessionDay, Schedule } from '../models/schedule.interface';
import { Session } from '../models/session.interface';

export const scheduleSessions = (
  dateCongress: DateCongress,
  dayIndex: number,
  sessionsStorage: Schedule[],
  queryText: string,
  listFavorites: Session[],
  filtersSelected: FilterSelectedInterface[],
  splitQueryWords: boolean,
  isTraining: boolean = false
) => {
  const sessionsToShow: FavoriteSessionDay[] = [];
  let countSessionsFound = 0;

  if (dayIndex >= 999) {
    for (const sessionsIndex in sessionsStorage) {
      if (sessionsIndex) {
        const sessions = sessionsStorage[sessionsIndex];

        countSessionsFound += scheduleSessionsWithSessionIndex(
          dateCongress,
          sessions,
          sessionsToShow,
          parseInt(sessionsIndex, 10),
          queryText,
          listFavorites,
          filtersSelected,
          splitQueryWords,
          isTraining
        );
      }
    }
  } else {
    const sessionsIndex = dayIndex;
    const sessions = sessionsStorage[sessionsIndex];

    countSessionsFound = scheduleSessionsWithSessionIndex(
      dateCongress,
      sessions,
      sessionsToShow,
      sessionsIndex,
      queryText,
      listFavorites,
      filtersSelected,
      splitQueryWords,
      isTraining
    );
  }

  return {
    sessionsToShow,
    countSessionsFound,
  };
};

const scheduleSessionsWithSessionIndex = (
  dateCongress: DateCongress,
  sessions: Schedule,
  sessionsToShow: FavoriteSessionDay[],
  sessionsIndex: number,
  queryText: string,
  listFavorites: Session[],
  filtersSelected: FilterSelectedInterface[],
  splitQueryWords: boolean,
  isTraining: boolean = false,
) => {
  let dayTime = null;
  let sessionsToImport = [];
  let countSessionsFound = 0;

  let queryWords = [queryText.trim()];
  if (splitQueryWords) {
    queryWords = queryText.split(' ')?.filter((w) => !!w.trim().length);
  }
  let matchesQueryText = true;

  if (sessions?.groups) {
    for (const group of sessions.groups) {
      sessionsToImport = [];

      const roomFilterSelected = filtersSelected.find((f) => f.key === 'room')?.value;
      const topicsFilterSelected = filtersSelected.find((f) => f.key === 'topics')?.value;
      const themesFilterSelected = filtersSelected.find((f) => f.key === 'themes')?.value;
      const tracksFilterSelected = filtersSelected.find((f) => f.key === 'tracks')?.value;
      const hubsFilterSelected = filtersSelected.find((f) => f.key === 'hubs')?.value;
      const focusesFilterSelected = filtersSelected.find((f) => f.key === 'focuses')?.value;
      const sponsorsFilterSelected = filtersSelected.find((f) => f.key === 'sponsors')?.value;

      for (const session of group.sessions) {
        const hasRoomSelected = roomFilterSelected?.includes(session.room);
        const hasTopicsSelected =
          topicsFilterSelected && topicsFilterSelected.filter((f) => session.topics.find((t) => t.title === f)).length > 0;
        const hasThemesSelected =
          themesFilterSelected && themesFilterSelected.filter((f) => session.themes.find((t) => t.name === f)).length > 0;
        const hasTracksSelected =
          tracksFilterSelected && tracksFilterSelected.filter((f) => session.tracks.find((t) => t.title === f)).length > 0;
        const hasHubsSelected = hubsFilterSelected && hubsFilterSelected.filter((f) => session.hub.find((t) => t.name === f)).length > 0;
        const hasFocusesSelected =
          focusesFilterSelected && focusesFilterSelected.filter((f) => session.focus.find((t) => t.name === f)).length > 0;
        const hasSponsorsSelected =
          sponsorsFilterSelected && sponsorsFilterSelected.filter((f) => session.sponsors.find((t) => t.title === f)).length > 0;

        const hasNoFilterSelected =
          roomFilterSelected?.length === 0 &&
          topicsFilterSelected?.length === 0 &&
          themesFilterSelected?.length === 0 &&
          tracksFilterSelected?.length === 0 &&
          hubsFilterSelected?.length === 0 &&
          focusesFilterSelected?.length === 0 &&
          sponsorsFilterSelected?.length === 0;

        if (
          hasNoFilterSelected ||
          ((hasRoomSelected || (roomFilterSelected && roomFilterSelected.length === 0)) &&
            (hasTopicsSelected || (topicsFilterSelected && topicsFilterSelected.length === 0)) &&
            (hasThemesSelected || (themesFilterSelected && themesFilterSelected.length === 0)) &&
            (hasTracksSelected || (tracksFilterSelected && tracksFilterSelected.length === 0)) &&
            (hasHubsSelected || (hubsFilterSelected && hubsFilterSelected.length === 0)) &&
            (hasFocusesSelected || (focusesFilterSelected && focusesFilterSelected.length === 0)) &&
            (hasSponsorsSelected || (sponsorsFilterSelected && sponsorsFilterSelected.length === 0)))
        ) {
          matchesQueryText = false;
          if (queryWords.length) {
            const moderatorNamesConcat = session.moderators
              ?.filter((m) => !m.hidden)
              .map((f) => `${f.firstName} ${f.lastName}`)
              .join(' ');
            const speakerNamesConcat = session.speakers
              ?.filter((s) => !s.hidden)
              .map((f) => `${f.firstName} ${f.lastName}`)
              .join(' ');
            const facultiesNamesConcat = session.faculties
              ?.filter((f) => !f.hidden)
              .map((f) => `${f.firstName} ${f.lastName}`)
              .join(' ');
            queryWords.forEach((queryWord: string) => {
              if (
                session.title.toLowerCase().indexOf(queryWord) > -1 ||
                moderatorNamesConcat?.toLowerCase().indexOf(queryWord) >= 0 ||
                speakerNamesConcat?.toLowerCase().indexOf(queryWord) >= 0 ||
                facultiesNamesConcat?.toLowerCase().indexOf(queryWord) >= 0 ||
                session.specificMessage?.toLowerCase().indexOf(queryWord) >= 0 ||
                session.reference?.toLowerCase().indexOf(queryWord) >= 0
              ) {
                matchesQueryText = true;
              }
            });
          } else {
            matchesQueryText = true;
          }

          if (listFavorites) {
            session.isfavorite = !!listFavorites.find((f) => f?.idSession === session?.idSession);
          } else {
            session.isfavorite = false;
          }

          if (matchesQueryText) {
            sessionsToImport.push(session);
            countSessionsFound++;
            if (isTraining) {
              if (dayTime !== dateCongress.daysTermsTraining[sessionsIndex] + '_' + group.time) {
                sessionsToShow.push({
                  day: dateCongress.daysTermsTraining[sessionsIndex],
                  time: group.time,
                  sessions: sessionsToImport,
                  dayIndex: sessionsIndex,
                });
                dayTime = dateCongress.daysTermsTraining[sessionsIndex] + '_' + group.time;
              }
            } else {
              if (dayTime !== dateCongress.daysTerms[sessionsIndex] + '_' + group.time) {
                sessionsToShow.push({
                  day: dateCongress.daysTerms[sessionsIndex],
                  time: group.time,
                  sessions: sessionsToImport,
                  dayIndex: sessionsIndex,
                });
                dayTime = dateCongress.daysTerms[sessionsIndex] + '_' + group.time;
              }
            }
          }
        }
      }
    }
  }

  return countSessionsFound;
};

export const scheduleSessionsVod = (sessions: Session[], queryText: string, listFavorites: any[], filtersSelected: any) => {
  const sessionsToShow = [];
  let countSessionsFound = 0;

  const queryWords = queryText.split(' ')?.filter((w) => !!w.trim().length);
  let matchesQueryText = true;

  const simpleAttributes = ['location', 'sponsors', 'themes'];
  const specificAttributes = ['topics', 'replayUrl'];

  for (const session of sessions) {
    let canSelect = true;

    for (const { key, value } of filtersSelected) {
      const sessionValue = session[key as keyof Session] as string | string[];

      const isSameSimple = simpleAttributes.includes(key) && value.includes(sessionValue);
      const isSameTopics =
        key === 'topics' &&
        sessionValue instanceof String &&
        sessionValue?.split(',')?.find((oneTopicSession) => value.includes(oneTopicSession.trim()));

      const isSameReplay = key === 'replayUrl' && ((value.includes('Oui') && sessionValue) || (value.includes('Non') && !sessionValue));
      const isSameArray =
        !(simpleAttributes.includes(key) || specificAttributes.includes(key)) &&
        sessionValue instanceof Array &&
        sessionValue?.find((oneSession) => value.includes(oneSession));

      if (value.length !== 0 && !isSameSimple && !isSameTopics && !isSameArray && !isSameReplay) {
        canSelect = false;
        break;
      }
    }

    if (canSelect) {
      matchesQueryText = false;
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (
            session.title.toLowerCase().indexOf(queryWord) > -1 ||
            session.moderators
              .map((m) => `${m.firstName} ${m.lastName}`)
              .join(', ')
              .toLowerCase()
              .indexOf(queryWord) >= 0 ||
            session.speakers
              .map((m) => `${m.firstName} ${m.lastName}`)
              .join(', ')
              .toLowerCase()
              .indexOf(queryWord) >= 0
          ) {
            matchesQueryText = true;
          }
        });
      } else {
        matchesQueryText = true;
      }

      if (listFavorites) {
        session.isfavorite = !!listFavorites.find((f) => f.idSession === session.idSession);
      } else {
        session.isfavorite = false;
      }

      if (matchesQueryText) {
        sessionsToShow.push(session);
        countSessionsFound++;
      }
    }
  }

  return {
    sessionsToShow,
    countSessionsFound,
  };
};

export const removeHiddenSession = (schedule: Schedule[]): Schedule[] =>
  cloneDeep(schedule).map((day) => ({
    ...day,
    groups: day.groups.map((group) => ({
      ...group,
      sessions: group.sessions.filter((session) => !session.hidden),
    })),
  }));
