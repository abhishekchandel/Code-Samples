import { createAction, props } from '@ngrx/store';
import { ActionPayloadData } from '@project/entities';
import { DealLender } from '../../models';

export const saveDealLender = createAction('[Deal Lender] Add Deal Lender');
export const saveDealLenderSuccess = createAction('[Deal Lender] Add Deal Lender Success', props<DealLender>());
export const updateDealLenderSuccess = createAction('[Deal Lender] Update Deal Lender Success', props<DealLender>());
export const saveDealLenderFailure = createAction('[Deal Lender] Add Deal Lender Failure');

export const getDealLenders = createAction('[Deal Lender] Get Deal Lenders', props<ActionPayloadData<boolean>>());
export const getDealLendersSuccess = createAction('[Deal Lender] Get Deal Lender Success', props<ActionPayloadData<{ lenders: DealLender[]; id: number }>>());
export const getDealLendersFailure = createAction('[Deal Lender] Get Deal Lender Failure');

export const updateLenderDetails = createAction('[Deal Lender] Update Deal Lender Details', props<ActionPayloadData<DealLender>>());
export const updateLenderSelection = createAction('[Deal Lender Update Deal Lender selection', props<ActionPayloadData<DealLender>>());
export const updateLenderSelectionSuccess = createAction('[Deal Lender Update Deal Lender selection Success');

export const getLenderDetails = createAction('[Deal Lender] Get Deal Lender Details', props<ActionPayloadData<number>>());

export const resetLenderDetails = createAction('[Deal Lender] Reset Lender Details');
