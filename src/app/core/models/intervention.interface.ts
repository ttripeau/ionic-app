import { Role } from './role.interface';
import { Speaker } from './speaker.interface';
import { Specialty } from './specialty.interface';
import { Sponsor } from './sponsor.interface';

export interface Intervention {
  idDate: number;
  idSession: string;
  date: string;
  abstractId: string;
  titleFR: string;
  timeBegin: string;
  speakers: Speaker[];
  order: number;
  title: string;
  titleSession: string;
  typeSession: string;
  sponsors: Sponsor[];
  time: string;
  themes: Specialty[];
  role: Role;
  roleSpeaker: Role;
  hidden: boolean;
  guestComment: string;
}
