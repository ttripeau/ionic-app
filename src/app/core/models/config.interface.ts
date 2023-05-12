import { SlideInterface } from 'src/app/shared/components/slider-sponsor/slider-sponsor.component';
import { MenuTab } from './menu-tab.interface';
import { Link } from './link.interface';
import { VerticalButton } from './verticalButton.interface';

export interface DateCongress {
  start: string;
  end: string;
  days: {
    [key: number]: string;
  };
  daysTraining: {
    [key: number]: string;
  };
  daysSubCongress: {
    [key: number]: string;
  };
  daysTerms: {
    [key: number]: string;
  };
  daysTermsTraining: {
    [key: number]: string;
  };
  daysTermsSubCongress: {
    [key: number]: string;
  };
  interactivityRooms: {
    key: string;
    room: string;
    text: string;
    slidoKey?: string;
    gotTalent?: string;
    color: string;
  }[];
  subCongresses: {
    room: string;
    text: string;
    route: string;
    color: string;
    key: string;
  }[];
  actualDate: null | string;
}

export interface Filter {
  val: number | string;
  label?: string;
  isChecked: boolean;
  id?: string | number;
  data?: string;
  isTheme?: boolean;
  nameSpecialty?: string;
  idSpecialty?: string;
}

export interface DataConfig {
  congressName: string;
  congressNameWithoutSpace: string;
  language: string;
  sortedRoom: string[];
  queryText: {
    programme: string;
    programmeTraining: string;
    abstracts: string;
    speakers: string;
    vod: string;
    exhibitor: string;
    users: string;
  };
  socialnetworks: {
    website: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    platform: string;
    survey: string;
    cme: string;
    replay: string;
  };
  entities: {
    icon?: {
      name?: string;
      src?: string;
    };
    label: string;
    link: string;
  }[];
}

export interface AppConfig {
  favoritePosters: {
    size: number;
  };
  strapiVersion: string;
  styleSheetVersion: string;
  loginRequired: boolean;
  splash: boolean;
  durationSplashScreen: number; // en ms
  pushNotificationTopicsSize: number;
  noShowTabs: string[];
  speakersPage: {
    showInitials: boolean;
  };
  pages: {
    home: {
      rooms: string[];
      showSpeakers: boolean;
      showOnlyWebsite: boolean;
      showAllSocialNetworks: boolean;
      showEntities: boolean;
      showSlider: boolean;
      showUniqueSlide: boolean;
      showBadge: boolean;
      showVoucher: boolean;
      showLogoInBottomBorders: boolean;
      mainButtons: VerticalButton[];
      subCongresses: {
        start: string;
        end: string;
      };
    };
    programme: {
      tabs: string[];
    };
    sessionDetail: {
      mainSponsor: {
        name: string;
        route: string;
      };
    };
  };
  burger: {
    title: string;
    links: Link[];
  }[];
  menuTabs: MenuTab[];
  registrationUrl: string;
  cguLogin: string;
  privacyPolicy: string;
  forgotPassword: string;
  pcrGotTalentUrl: string;
  texts?: {
    certificateAttendance: string;
    about: string;
    schedule: string;
    vod: string;
    posters: string;
    postersFilter: string;
    mySessions: string;
    specialYouth: string;
    news: string;
  };
  links?: {
    synopsis: string;
    replay: string;
    vod: string;
    neuroQuizz: string;
    certificateAttendance: string;
    news: string;
    askyourQuestions: string;
    posters: string;
    eStand: string;
    practicalInfo: string;
    practicalInfo2: string;
    remotePracticalInformation: string;
    eloquenceContest: string;
    youthSpecial: string;
    interactivity: string;
    medtronicContactUs: string;
    evaluateSessions: string;
    uniqueSlide: string;
  };
  cgu: string;
  abstractPdf: string;
  scanExpoSendMailUrl: string;
  scanExpoExportUrl: string;
  notesExportSendMailUrl: string;
  interactiveMap: {
    defaultLevel: number;
  };
  minimalRequiredVersion: {
    ios: string;
    android: string;
  };
  gapTimezoneMinutesProgramme: number;
  addToCalendar: {
    offsetTimezoneMinutes: number;
    timezone: string;
  };
}

export interface Picture {
  src: string;
  link: string;
}

export interface TemplateConfig {
  logoHeader: string;
  logoHeaderRGB: string;
  logoHeaderBg: string;
  mode: string;
  buttonBgColor: string;
  buttonTxtColor: string;
  buttonTxtColorButtonCustoms: string;
  colorCongress: string;
  colorSplash: string;
  colorCongressTer: string;
  colorCongressBis: string;
  pictures: {
    date: string;
    splash: Picture;
    mainSponsor: Picture;
  }[];
  slides: SlideInterface[];
  vote: {
    startTime: string;
    endTime: string;
    message: string;
  };
}
