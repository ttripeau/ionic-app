import { createAction, props } from '@ngrx/store';
import { StrapiStateInterface } from '../reducers/strapi.reducer';

export const setProgrammeFiltersScientific = createAction(
  '[Congress Strapi] SetProgrammeFiltersScientific',
  props<{ filters: StrapiStateInterface['programme']['filters']['scientific'] }>()
);
export const setProgrammeFiltersTraining = createAction(
  '[Congress Strapi] SetProgrammeFiltersTraining',
  props<{ filters: StrapiStateInterface['programme']['filters']['training'] }>()
);
export const setProgrammeFiltersVod = createAction(
  '[Congress Strapi] SetProgrammeFiltersVod',
  props<{ filters: StrapiStateInterface['programme']['filters']['vod'] }>()
);

export const setAbstractsFilters = createAction(
  '[Congress Strapi] SetAbstractsFilters',
  props<{ filters: StrapiStateInterface['abstracts']['filters'] }>()
);

export const setExhibitorsFilters = createAction(
  '[Congress Strapi] SetExhibitorsFilters',
  props<{ filters: StrapiStateInterface['exhibitors']['filters'] }>()
);

export const setStrapi = createAction('[Congress Strapi] SetStrapi', props<{ strapi: StrapiStateInterface }>());
