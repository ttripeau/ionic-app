import { DataFilter } from 'src/app/core/store/reducers/strapi.reducer';

const resetScheduleFilters = (filters: DataFilter) => {
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'days') {
      value.forEach(e => {
        if (e.val === 999) {
          e.isChecked = true;
        } else {
          e.isChecked = false;
        }
      });
    } else {
      value.forEach(e => {
        e.isChecked = false;
      });
    }
  });
};

export const resetProgrammeScientificFilters = (filters: DataFilter) => {
  resetScheduleFilters(filters);
};

export const resetProgrammeTrainingFilters = (filters: DataFilter) => {
  resetScheduleFilters(filters);
};

export const resetProgrammeVodFilters = (filters: DataFilter) => {
  resetScheduleFilters(filters);
};

export const resetAbstractFilters = (filters: DataFilter) => {
  resetScheduleFilters(filters);
};

export const resetExhibitorFilters = (filters: DataFilter) => {
  resetScheduleFilters(filters);
};
