import { Action, createReducer, on } from '@ngrx/store';
import { Exhibitor } from 'src/app/core/models/exhibitor.interface';
import { InteractiveMap } from 'src/app/core/models/interactive-map.interface';
import { Product } from 'src/app/core/models/product.interface';
import { Schedule } from 'src/app/core/models/schedule.interface';
import { Session } from 'src/app/core/models/session.interface';
import { Speaker } from 'src/app/core/models/speaker.interface';
import {
  dateCongress as dateConfigCongress,
  dataConfig as dataConfigCongress,
  appConfig as appConfigCongress,
  templateConfig as templateConfigCongress,
} from 'src/app/core/config/congress.config';
import { Abstract } from 'src/app/core/models/abstract.interface';
import { DateCongress, DataConfig, AppConfig, TemplateConfig, Filter } from 'src/app/core/models/config.interface';
import {
  setAbstractsFilters,
  setExhibitorsFilters,
  setProgrammeFiltersScientific,
  setProgrammeFiltersTraining,
  setProgrammeFiltersVod,
  setStrapi,
} from '../actions/strapi.actions';

export interface DataFilter {
  [key: string]: Filter[];
}

export interface StrapiStateInterface {
  abstracts: {
    content: Abstract[];
    filters: DataFilter;
  };
  config: {
    dateCongress: DateCongress;
    dataConfig: DataConfig;
    appConfig: AppConfig;
    templateConfig: TemplateConfig;
  };
  exhibitors: {
    content: Exhibitor[];
    products: Product[];
    filters: DataFilter;
    interactiveMap: InteractiveMap;
    interactiveMapAssociations: InteractiveMap;
  };
  generalInformation: {
    about: string;
    certificateAttendance: string;
    neuralQuizz: string;
    replay: string;
    inscription: string;
    jobs: string;
    needUpdateVersion: string;
    cgu: string;
    customPages: {
      id: number;
      label: string;
      content: string;
      title: string;
    }[];
  };
  programme: {
    speakers: Speaker[];
    schedule: {
      scientific: Schedule[];
      training: Schedule[];
      subCongress: {
        [subCongress: string]: Schedule[];
      };
      vod: Session[];
    };
    filters: {
      scientific: DataFilter;
      training: DataFilter;
      vod: DataFilter;
    };
  };
  splashIsLoading: boolean;
}

export const initialState: StrapiStateInterface = {
  abstracts: {
    content: [],
    filters: {},
  },
  config: {
    dateCongress: dateConfigCongress,
    dataConfig: dataConfigCongress,
    appConfig: appConfigCongress,
    templateConfig: templateConfigCongress,
  },
  exhibitors: {
    content: [],
    products: [],
    filters: {},
    interactiveMap: {},
    interactiveMapAssociations: {},
  },
  generalInformation: {
    about: '',
    certificateAttendance: '',
    neuralQuizz: '',
    replay: '',
    inscription: '',
    jobs: '',
    needUpdateVersion: '',
    cgu: '',
    customPages: [],
  },
  programme: {
    speakers: [],
    schedule: {
      scientific: [],
      training: [],
      subCongress: {},
      vod: [],
    },
    filters: {
      scientific: {
        days: [],
      },
      training: {
        days: [],
      },
      vod: {
        days: [],
      },
    },
  },
  splashIsLoading: true,
};

const strapiReducerMap = createReducer(
  initialState,
  on(setStrapi, (state, { strapi }) => ({
    ...state,
    ...strapi,
  })),
  on(setProgrammeFiltersScientific, (state, { filters }) => ({
    ...state,
    programme: {
      ...state.programme,
      filters: {
        ...state.programme.filters,
        scientific: filters,
      },
    },
  })),
  on(setProgrammeFiltersTraining, (state, { filters }) => ({
    ...state,
    programme: {
      ...state.programme,
      filters: {
        ...state.programme.filters,
        training: filters,
      },
    },
  })),
  on(setProgrammeFiltersVod, (state, { filters }) => ({
    ...state,
    programme: {
      ...state.programme,
      filters: {
        ...state.programme.filters,
        vod: filters,
      },
    },
  })),
  on(setAbstractsFilters, (state, { filters }) => ({
    ...state,
    abstracts: {
      ...state.abstracts,
      filters,
    },
  })),
  on(setExhibitorsFilters, (state, { filters }) => ({
    ...state,
    exhibitors: {
      ...state.exhibitors,
      filters,
    },
  }))
);

export const strapiReducer = (state: StrapiStateInterface, action: Action) => strapiReducerMap(state, action);
