import { Session } from '../models/session.interface';

export const getCountDown = (tmpDate: Date, actualDate: Date) => {
  const diffSeconds = (actualDate.getTime() - tmpDate.getTime()) / 1000;
  return Math.floor(diffSeconds / 60);
};

export const getCountDownDays = (tmpDate: Date, actualDate: Date) => {
  const diffSeconds = (tmpDate.getTime() - actualDate.getTime()) / 1000;
  return Math.floor(diffSeconds / 60 / 60 / 24);
};

export const getCountDownHours = (tmpDate: number, actualDate: Date) => {
  const diffSeconds = (tmpDate - actualDate.getTime()) / 1000;
  return Math.floor(diffSeconds / 60 / 60);
};

export const getCountDownMins = (tmpDate: number, actualDate: Date) => {
  const diffSeconds = (tmpDate - actualDate.getTime()) / 1000;
  return Math.floor(diffSeconds / 60);
};

export const pushOnSessionToShow = (
  sessionsToShow: { [key: string]: Session },
  session: Session,
  actualDate: Date,
  offset: number
) => {
  const offsetTimezone = offset * 60;

  const dateTmpDebut = new Date((parseInt(session.timeBeginTimeStamp, 10) + offsetTimezone) * 1000);
  const dateTmpDebutTime = dateTmpDebut.getTime();

  const dateTmpFin = new Date((parseInt(session.timeEndTimestamp, 10) + offsetTimezone) * 1000);
  const dateTmpFinTime = dateTmpFin.getTime();

  sessionsToShow[session.room] = {
    id: session.id,
    idSession: session.idSession,
    idDate: parseInt(session.idDate as string, 10),
    room: session.room,
    title: session.title,
    sentence: session.sentence,
    decalage: Math.floor(getCountDown(dateTmpFin, actualDate)),
    decalageDays: Math.floor(getCountDownDays(dateTmpDebut, actualDate)),
    decalageHours: Math.floor(getCountDownHours(dateTmpDebutTime, actualDate)),
    decalageMins: Math.floor(getCountDownMins(dateTmpDebutTime, actualDate)),
    progress: 1 - (dateTmpFinTime - actualDate.getTime()) / (dateTmpFinTime - dateTmpDebutTime),
    timeBegin: session.timeBegin,
    timeEnd: session.timeEnd,
  } as Session;
};

export const feedSessionsHTML = (sessionsHTML: Session[], sessionsToShow: { [key: string]: Session }) => {
  for (const session of Object.values(sessionsToShow)) {
    if (session) {
      sessionsHTML.push(session);
    }
  }
};
