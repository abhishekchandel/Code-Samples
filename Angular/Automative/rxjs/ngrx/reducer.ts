import { Action, createReducer, on } from '@ngrx/store';
import { DealLender, LossPayeeInfo, LienHolderInfo } from '../../models';
import * as DealLendersActions from '../actions';
import { FormStatus } from '@project/entities';

export interface DealLenderState {
  loaded: boolean;
  lenders: DealLender[];
  lenderDetails: DealLender;
}

export const initialDealLenderState: DealLenderState = {
  loaded: false,
  lenders: [],
  lenderDetails: new DealLender(),
};

const reducer = createReducer(
  initialDealLenderState,

  on(DealLendersActions.getDealLendersSuccess, (state, { data }) => {
    const { lenders, id } = data;
    const lender = lenders.find((l) => l.dealLenderId === id);
    const lenderDetails = lender ?? new DealLender();
    return {
      ...state,
      lenders: lenders,
      lenderDetails: { ...lenderDetails },
      loaded: true,
    };
  }),
  on(DealLendersActions.getLenderDetails, (state, { data }) => {
    const { lenders } = state;
    const lenderDetails = lenders.find((lender) => lender.dealLenderId == data);
    return {
      ...state,
      lenderDetails: { ...lenderDetails, ...new FormStatus() },
    };
  }),

  on(DealLendersActions.saveDealLenderSuccess, (state, data) => {
    return {
      ...state,
      lenders: state.lenders.concat(data),
    };
  }),

  on(DealLendersActions.updateLenderDetails, (state, { data }) => {
    return {
      ...state,
      lenderDetails: { ...data },
    };
  }),
  on(DealLendersActions.updateFormStatus, (state, { data }) => {
    const { lenderDetails } = state;
    return {
      ...state,
      lenderDetails: { ...lenderDetails, ...data },
    };
  }),

  on(DealLendersActions.updateLenderSelection, (state, { data }) => {
    const { lenders } = state;
    return {
      ...state,
      lenderDetails: { ...data },
      lenders: lenders.map((lender) => {
        if (lender.dealLenderId == data.dealLenderId) {
          return data;
        }
        return Object.assign({}, lender, { isSelected: false });
      }),
    };
  }),

  on(DealLendersActions.updateDealLenderSuccess, (state, data) => {
    const { lenders } = state;
    const dealLenderIndex = lenders.findIndex((u) => u.dealLenderId == data.dealLenderId);
    return {
      ...state,
      lenders: lenders.map((lender, i) => {
        if (dealLenderIndex == i) {
          return Object.assign({}, lender, {
            ...data,
            lossPayee: data.lossPayee ? data.lossPayee : new LossPayeeInfo(),
            lienHolder: data.lienHolder ? data.lienHolder : new LienHolderInfo(),
          });
        }
        if (dealLenderIndex != i && data.isSelected) {
          return Object.assign({}, lender, {
            isSelected: false,
          });
        }
        return lender;
      }),
      lenderDetails:{...data,...new FormStatus() }
    };
  }),

  on(DealLendersActions.updateLenderSelectionSuccess, (state) => {
    return {
      ...state,
      lenderDetails: { ...new DealLender(), ...new FormStatus(false) },
    };
  }),

  on(DealLendersActions.resetLenderDetails, (state) => {
    return {
      ...state,
      lenderDetails: { ...new DealLender(), ...new FormStatus(true) },
    };
  }),

  on(DealLendersActions.resetEvent, () => {
    return Object.assign({}, initialDealLenderState);
  })
);

export function dealLenderReducer(state: DealLenderState, action: Action) {
  return reducer(state, action);
}
