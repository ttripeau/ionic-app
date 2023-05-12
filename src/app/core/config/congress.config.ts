import { AppConfig, DataConfig, DateCongress, TemplateConfig } from 'src/app/core/models/config.interface';

export const dateCongress: DateCongress = {
  start: new Date().toISOString(),
  end: new Date().toISOString(),
  days: {},
  daysTraining: {},
  daysSubCongress: {},
  daysTerms: {},
  daysTermsTraining: {},
  daysTermsSubCongress: {},
  interactivityRooms: [],
  subCongresses: [],
  // actualDate: '2022-05-20T07:46:00.000Z',
  actualDate: null,
};

export const dataConfig: DataConfig = {
  congressName: 'PCR Courses',
  congressNameWithoutSpace: 'PCRLONDON2022',
  language: 'en',
  queryText: {
    programme: '',
    programmeTraining: '',
    abstracts: '',
    speakers: '',
    vod: '',
    exhibitor: '',
    users: '',
  },
  sortedRoom: [],
  entities: [],
  socialnetworks: {
    website: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    instagram: '',
    platform: '',
    survey: '',
    cme: '',
    replay: '',
  },
};

export const appConfig: AppConfig = {
  pages: {
    home: {
      rooms: [],
      showSpeakers: false,
      showOnlyWebsite: false,
      showAllSocialNetworks: false,
      showEntities: false,
      showSlider: false,
      showUniqueSlide: false,
      showBadge: false,
      showVoucher: false,
      showLogoInBottomBorders: false,
      mainButtons: [],
      subCongresses: {
        start: '',
        end: '',
      },
    },
    programme: {
      tabs: ['schedule', 'schedule-training'],
    },
    sessionDetail: {
      mainSponsor: {
        name: '',
        route: '',
      },
    },
  },
  burger: [],
  menuTabs: [
    {
      tabName: 'home',
      label: 'tabs.home',
      icon: {
        name: 'home',
      },
    },
    {
      tabName: 'programme',
      label: 'tabs.programme',
      icon: {
        name: 'calendar',
      },
    },
    {
      label: 'tabs.join-chat',
      click: {
        method: 'openModalInteractiviteList',
        params: [],
      },
      icon: {
        name: 'chatbox-ellipses',
      },
    },
    {
      tabName: 'speakers',
      label: 'tabs.speakers',
      icon: {
        name: 'people',
      },
    },
    {
      tabName: 'exposants',
      label: 'tabs.exposants',
      icon: {
        name: '',
        src: 'assets/icon/store.svg',
      },
    },
  ],
  strapiVersion: '2.1.0',
  styleSheetVersion: '1',
  loginRequired: false,
  splash: false,
  durationSplashScreen: 2500, // en ms
  pushNotificationTopicsSize: 2,
  noShowTabs: [
    '/app/tabs/splash',
    '/app/tabs/chat-list',
    '/app/tabs/new-conversation',
    '/app/tabs/camera',
    '/app/tabs/messages-and-notifications-center',
    '/app/tabs/messages-center',
    '/app/tabs/notifications-center',
  ],
  speakersPage: {
    showInitials: true,
  },
  registrationUrl: '',
  cguLogin: '',
  privacyPolicy: '',
  forgotPassword: '',
  pcrGotTalentUrl: '',
  texts: {
    certificateAttendance: '',
    about: '',
    schedule: '',
    vod: '',
    posters: '',
    postersFilter: '',
    mySessions: '',
    specialYouth: '',
    news: '',
  },
  links: {
    synopsis: '',
    vod: '',
    certificateAttendance: '',
    neuroQuizz: '',
    replay: '',
    news: '',
    askyourQuestions: '',
    posters: '',
    eStand: '',
    practicalInfo: '',
    practicalInfo2: '',
    remotePracticalInformation: '',
    eloquenceContest: '',
    youthSpecial: '',
    interactivity: '',
    medtronicContactUs: '',
    evaluateSessions: '',
    uniqueSlide: '',
  },
  cgu: '',
  abstractPdf: '',
  scanExpoSendMailUrl: '',
  scanExpoExportUrl: '',
  notesExportSendMailUrl: '',
  interactiveMap: {
    defaultLevel: 0,
  },
  minimalRequiredVersion: {
    ios: '1.0.0',
    android: '1.0.0',
  },
  gapTimezoneMinutesProgramme: -60,
  addToCalendar: {
    offsetTimezoneMinutes: 60,
    timezone: 'Europe/Paris',
  },
  favoritePosters: {
    size: 2,
  },
};

export const templateConfig: TemplateConfig = {
  logoHeader: 'assets/img/logo_congres.png',
  logoHeaderRGB: 'assets/img/logo_congres_rgb.png',
  logoHeaderBg: 'assets/img/logo_congres_bg.jpg',
  mode: 'light',
  buttonBgColor: 'light',
  buttonTxtColor: 'congress',
  buttonTxtColorButtonCustoms: 'congressultralight',
  colorCongress: '#60267a',
  colorSplash: '#220532',
  colorCongressBis: '#220532',
  colorCongressTer: '#f98b64',
  pictures: [
    {
      date: '2022-10-05',
      splash: {
        src: 'assets/img/splash/day-1',
        link: '',
      },
      mainSponsor: {
        src: 'assets/img/menu/day-1.png',
        link: '',
      },
    },
  ],
  slides: [],
  vote: {
    startTime: '1678199985723',
    endTime: '1778199985723',
    message: '',
  },
};
