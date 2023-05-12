import { Focus } from './focus.interface';
import { Intervention } from './intervention.interface';
import { Role } from './role.interface';
import { Room } from './room.interface';
import { Society } from './society.interface';
import { Speaker } from './speaker.interface';
import { Special } from './special.interface';
import { Specialty } from './specialty.interface';
import { Sponsor } from './sponsor.interface';
import { Tag } from './tag.interface';
import { TargetAudience } from './targetAudience.interface';
import { Topic } from './topic.interface';
import { Type } from './type.interface';

export interface Session {
  date: string;
  idDate: string | number;
  type: string;
  title: string;
  timeBegin: string;
  timeBeginTimeStamp: string;
  timeEnd: string;
  timeEndTimestamp: string;
  code: string;
  roomContains: string;
  idRoom: string;
  status: string;
  moderators: Speaker[];
  idSession: number;
  interventions: Intervention[];
  room: string;
  tracks: Type[];
  congress: string;
  color: string;
  speakers: Speaker[];
  halfday: string;
  dateTimestamp: string;
  sponsors: Sponsor[];
  sponsored: Sponsor[];
  idExhibitor: string;
  isVod: boolean;
  replayURL: string;
  themes: Specialty[];
  targetedAudience: TargetAudience[];
  special: Special[];
  reference: string;
  faculties: Speaker[];
  hub: Society[];
  focus: Focus[];
  objectives: string[];
  objectiveSentence: string;
  specificMessage: string;
  collaboration: string;
  topics: Topic[];
  lastUpdate: string;
  id: string;
  decalage: number;
  progress: number;
  decalageMins: number;
  decalageHours: number;
  decalageDays: number;
  isfavorite?: boolean;
  description: string;
  sentence: string;
  sentenceFR: string;
  hide: boolean;
  doIAppear: boolean;
  hidden: boolean;
  ownRole: Role;
  tags: Tag[];
  rooms: Room[];
  guestComment: string;
  otherLink: string;
}