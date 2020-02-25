/* eslint-disable functional/no-expression-statement */
/**
 * Returns a year ago from input date.
 */
export const getDateYearFromDate = (date: Date): Date => {
  date.setFullYear(date.getFullYear() - 1);

  return date;
};
