/* eslint-disable @typescript-eslint/naming-convention */
import { InteractiveMap } from './interactive-map.interface';
import { Product } from './product.interface';

export interface Exhibitor{
  id: number;
  coordinates: InteractiveMap;
  boothNumber: string;
  name: string;
  webSite: string;
  order: string;
  logo: string;
  userName: string;
  presentation: string;
  idSponsor: string;
  address: string;
  phone: string;
  contactPhone: string;
  lastnameFirstname: string;
  country: string;
  notificationMail: string;
  companyMail: string;
  contactMail: string;
  productsDescription: string;
  type: 'exposant' | 'salle';
  Linkedin: string;
  Twitter: string;
  Instagram: string;
  Facebook: string;
  Youtube: string;
  idSponsorTraining: string;
  products: Product[];
  idSessions: any;
  themes: any;
}
