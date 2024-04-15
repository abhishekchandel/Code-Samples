import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DealLender } from '../../models';
import * as DealLendersActions from '../actions';
import { lendersQuery } from '../selectors';
import { FormStatus } from '@project/entities';

@Injectable()
export class DealLendersFacade {
  loaded$ = this.store.pipe(select(lendersQuery.loaded));
  lenders$ = this.store.pipe(select(lendersQuery.lenders));
  lenderDetails$ = this.store.pipe(select(lendersQuery.lenderDetails));
  lenderDetailsViewModel$ = this.store.pipe(select(lendersQuery.lenderDetailsViewModel));
  getDealLenderDetails$ = this.store.pipe(select(lendersQuery.lenderDetails));
  constructor(private readonly store: Store) {}

  saveUpdateDealLender() {
    this.store.dispatch(DealLendersActions.saveDealLender());
  }

  updateLenderDetails(payload) {
    this.store.dispatch(DealLendersActions.updateLenderDetails({ data: payload }));
  }

  getDealLenders(refresh = false) {
    this.store.dispatch(DealLendersActions.getDealLenders({ data: refresh }));
  }

  getDealLendersById(id: number) {
    this.store.dispatch(DealLendersActions.getLenderDetails({ data: id }));
  }

  updateLenderSelection(lender: DealLender) {
    this.store.dispatch(DealLendersActions.updateLenderSelection({ data: lender }));
  }
  updateFormStatus(formStatus: FormStatus) {
    this.store.dispatch(DealLendersActions.updateFormStatus({ data: formStatus }));
  }

  resetLenderDetails() {
    this.store.dispatch(DealLendersActions.resetLenderDetails());
  }
}
