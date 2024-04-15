import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoaderService, SnackbarService, UtilityService } from '@project/shared/services';
import { AppFacade } from '@project/store/app';
import { UserFacade } from '@project/store/user';
import { catchError, concatMap, exhaustMap, filter, finalize, map, of, tap, withLatestFrom } from 'rxjs';
import { service } from '../../services';
import * as DealLendersActions from '../actions';
import { DealFacade, DealLendersFacade } from '../facades';

@Injectable()
export class DealLendersEffects {
  getDealLenders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealLendersActions.getDealLenders),
      map((action) => action.data),
      withLatestFrom(
        this.dealLendersFacade.loaded$,
        this.dealFacade.isDealTypeChanged$,
        this.userFacade.currentOrgId$, 
        this.dealFacade.dealId$, 
        this.appFacade.currentRouteParams$
      ),
      filter(([refersh, loaded, isDealTypeChanged]) => refersh || !loaded || isDealTypeChanged),
      concatMap(([, , , orgId, dealId, routeParams]) => {
        const { id, lenderId } = routeParams;
        const computedDealId = dealId ?? id;
        return this.service.getLender(orgId, computedDealId).pipe(
          map((lenders) => {
            this.dealFacade.resetDealType();
            return DealLendersActions.getDealLendersSuccess({ data: { lenders, id: Number(lenderId) } });
          }),
          catchError(() => of(DealLendersActions.getDealLendersFailure())),
          finalize(() => this.loaderService.hideSpinner())
        );
      })
    )
  );

  saveDealLender$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealLendersActions.saveDealLender),
      withLatestFrom(
        this.userFacade.currentOrgId$,
        this.dealFacade.dealId$,
        this.userFacade.userName$,
        this.dealLendersFacade.lenderDetails$,
        this.dealLendersFacade.lenders$
      ),
      exhaustMap(([, orgId, dealId, userName, payload, lenders]) => {
        const lenderDetails = { ...payload };

        const isLienHolderEmpty = this.utilityService.isObjectEmpty(lenderDetails.lienHolder);
        if (isLienHolderEmpty) {
          delete lenderDetails.lienHolder;
        }

        const isLossPayeeEmpty = this.utilityService.isObjectEmpty(lenderDetails.lossPayee);
        if (isLossPayeeEmpty) {
          delete lenderDetails.lossPayee;
        }

        let lenderPayload = { ...lenderDetails, isSelected: lenderDetails.isSelected || lenders.length === 0 };

        const existingLenderId = lenderDetails.dealLenderId;

        const apiCall = existingLenderId
          ? this.service.updateDealLender(orgId, dealId, existingLenderId, lenderPayload)
          : this.service.saveDealLender(orgId, dealId, lenderPayload);
        this.appFacade.dataSaving();
        return apiCall.pipe(
          map((id) => {
            lenderPayload = {
              ...lenderPayload,
              dealLenderId: existingLenderId ?? id,
              modifyUserName: userName,
              modifyDateTimeUtc: this.utilityService.currentDateTimeUTC(),
            };
            return existingLenderId ? DealLendersActions.updateDealLenderSuccess(lenderPayload) : DealLendersActions.saveDealLenderSuccess(lenderPayload);
          }),
          tap(() => {
            this.appFacade.dataSaved(true);
            // Update Lender Details on Header
            if (lenderPayload.isSelected) {
              this.dealFacade.updateLenderName(lenderPayload);
            }
            this.snackbarService.success(existingLenderId ? 'deal.lenders.successMessage.update' : 'deal.lenders.successMessage.added');
            this.router.navigateByUrl(`/deals/${dealId}/lenders/${lenderPayload.dealLenderId}/details`);
          }),
          catchError(() => of(DealLendersActions.saveDealLenderFailure())),
          finalize(() => {
            setTimeout(() => this.appFacade.dataSaved(false), 2000);
          })
        );
      })
    )
  );

  updateLenderSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DealLendersActions.updateLenderSelection),
      map((action) => action.data),
      withLatestFrom(this.userFacade.currentOrgId$, this.dealFacade.dealId$, this.userFacade.userName$),
      concatMap(([payload, orgId, dealId]) => {
        this.appFacade.dataSaving();
        return this.service.updateLenderSelection(orgId, dealId, payload.dealLenderId, payload).pipe(
          map(() => {
            return DealLendersActions.updateLenderSelectionSuccess();
          }),
          tap(() => {
            // Update Lender Details on Header
            this.appFacade.dataSaved(true);
            if (payload.isSelected) {
              this.dealFacade.updateLenderName(payload);
            }
            this.snackbarService.success('deal.lenders.successMessage.update');
          }),
          catchError(() => of(DealLendersActions.updateCustomersFailure())),
          finalize(() => {
            setTimeout(() => {
              this.appFacade.dataSaved(false);
            }, 2000);
          })
        );
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private utilityService: UtilityService,
    private appFacade: AppFacade,
    private userFacade: UserFacade,
    private dealFacade: DealFacade,
    private service: service,
    private loaderService: LoaderService,
    private snackbarService: SnackbarService,
    private dealLendersFacade: DealLendersFacade,
    private router: Router
  ) {}
}
