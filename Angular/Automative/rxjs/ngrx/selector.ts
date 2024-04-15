import { createSelector } from '@ngrx/store';
import { State } from '../state';
import { getDealState } from './root.selector';
import { DealLenderState } from '../reducers';

const lenderSelector = createSelector(getDealState, (state: State) => state.lender);

const lenderLoaded = createSelector(lenderSelector, (state: DealLenderState) => state.loaded);
const lenders = createSelector(lenderSelector, (state: DealLenderState) => state.lenders);
const lenderDetails = createSelector(lenderSelector, (state: DealLenderState) => state.lenderDetails);

const lenderDetailsViewModel = createSelector(lenderLoaded, lenders, lenderDetails, (dataLoaded, lenders, lenderDetails) => {
  let sameLenderExist = false;
  if (lenderDetails?.dealLenderId) {
    sameLenderExist = lenders.some((l) => {
      return l.dealLenderId !== lenderDetails.dealLenderId && l.orgLenderId === lenderDetails.orgLenderId;
    });
  } else {
    sameLenderExist = lenders.some((l) => l.orgLenderId === lenderDetails.orgLenderId);
  }

  return {
    loaded: dataLoaded,
    lenderDetails,
    sameLenderExist,
  };
});

export const lendersQuery = {
  loaded: lenderLoaded,
  lenders: lenders,
  lenderDetails: lenderDetails,
  lenderDetailsViewModel,
};
