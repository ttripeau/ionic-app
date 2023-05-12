import { Session } from './session.interface';

export interface FavoriteSessionDay {
  day: string;
  dayIndex: number;
  sessions: Session[];
  time: string;
}

export interface ScheduleGroups {
  time: string;
  sessions: Session[];
}

export interface Schedule {
  date: string;
  groups: ScheduleGroups[];
}
