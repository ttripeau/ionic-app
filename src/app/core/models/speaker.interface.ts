import { Intervention } from './intervention.interface';
import { Role } from './role.interface';

export interface Speaker {
  id: string;
  idSpeaker: string;
  lastName: string;
  firstName: string;
  initials: string;
  specialty: string;
  profession: string;
  institute: string;
  department: string;
  function: string;
  email: string;
  picture: string;
  birthday: string;
  addressType: string;
  address: string;
  postcode: string;
  cedex: string;
  phone: string;
  phone2: string;
  mobile: string;
  title: string;
  interventions: Intervention[];
  conflicts: string[];
  town: string;
  country: string;
  role: Role;
  hidden: boolean;
  externalReference: string;
  biography: string;
}
