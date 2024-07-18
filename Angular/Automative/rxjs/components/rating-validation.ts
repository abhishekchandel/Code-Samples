import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaseFormComponent } from '@abc/base';
import { Unit, UnitMarineSubType, UnitTypeOption } from '@abc/entities';
import { EventService, RxjsService, SnackbarService } from '@abc/shared/services';
import { AppFacade } from '@abc/store/app';
import { skip, take } from 'rxjs';
import { TecAssuredField } from '../../../enum';
import {
    DealRateUnitComponentValidation,
    DealRateUnitValidation,
    ProviderCustomFieldDetails,
    UnitProviderCustomField,
    UnitValidationResponse,
} from '../../../models';
import { RateProductsFacade } from '../../../state/rate-products.facade';
import { RatingValidationsFormComponent } from '../../forms/rating-validations-form/rating-validations-form.component';

export interface RatingValidationsDialogData {
  dealId: number;
  units: Unit[];
}

@Component({
  selector: 'abc-rating-validations-dialog',
  templateUrl: './rating-validations-dialog.component.html',
  styleUrls: ['./rating-validations-dialog.component.scss'],
  providers: [RateProductsFacade],
})
export class RatingValidationsDialogComponent extends BaseFormComponent implements OnInit, OnDestroy {
  @ViewChildren('validationFormComponent') childComponents: QueryList<RatingValidationsFormComponent>;
  @ViewChild('form', { static: false }) public form: NgForm;

  loading = true;
  unitTypes: UnitTypeOption[] = [];
  unitWithMissingFields: DealRateUnitValidation[] = [];

  constructor(
    public override eventService: EventService,
    public dialogRef: MatDialogRef<RatingValidationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: RatingValidationsDialogData,
    private appFacade: AppFacade,
    private rateProductsFacade: RateProductsFacade,
    private snackbarService: SnackbarService,
    private router: Router,
    public override rxjsService: RxjsService
  ) {
    super(eventService, rxjsService);
    this.subscription.add(
      this.appFacade.unitTypes$.subscribe((res) => {
        this.unitTypes = res;
      })
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.rateProductsFacade.unitValidationResponse$.pipe(skip(1), take(1)).subscribe((data: UnitValidationResponse) => {
        const isValid = data?.units.some((u) => {
          return u.keys.some((key) => key === UnitMarineSubType.MarineEngineRequired);
        });
        if (isValid) {
          this.router.navigate([`/deals/${this.modalData.dealId}/units`]);
          this.snackbarService.error('deal.worksheet.protectionProducts.warningMessages.marineEngineRequired', 400);
          this.close();
          return;
        }
        if (!data.containsValidationKeys) {
          this.close(true);
          return;
        }

        this.buildMissingFieldsData(data.units);
        this.loading = false;
      })
    );

    this.rateProductsFacade.getIsValidRateFields(this.modalData.dealId);
  }

  buildMissingFieldsData(invalidUnits: DealRateUnitValidation[]) {
    const validationFields: DealRateUnitValidation[] = [];
    const { units } = this.modalData;

    units.forEach((u) => {
      const index = invalidUnits.findIndex((unit) => unit.unitId == u.unitId);
      const unit = invalidUnits[index];
      if (index > -1) {
        const unitIndex = units.findIndex((u) => u.unitId == unit.unitId);
        validationFields.push({
          unitId: u.unitId,
          label: unit.label,
          keys: unit.keys,
          components: [],
          unit: { ...u },
          unitNo: unitIndex + 1,
        });
        if (unit.components?.length > 0) {
          u.subUnits.forEach((su) => {
            const subIndex = unit.components.findIndex((com) => com.componentId == su.unitId);
            if (subIndex > -1) {
              const com = unit.components[subIndex];
              const engineIndex = u.subUnits.findIndex((u) => u.unitId == com.componentId);
              validationFields[index].components.push({
                componentId: com.componentId,
                label: com.label,
                keys: com.keys,
                unit: { ...su },
                componentNo: engineIndex + 1,
              });
            }
          });
        }
        if (unit.provider?.length > 0) {
          const { provider } = unit;
          validationFields[index].provider = provider;
          const additionalFields = Array.from({ length: provider?.length }, () => new UnitProviderCustomField());
          validationFields[index].additionalFields = additionalFields;
        }
      }
    });
    this.unitWithMissingFields = validationFields;
  }

  unitChanged(unit: Unit, index: number, subIndex = -1) {
    const updatedFields = this.unitWithMissingFields.map((data, unitIndex) => {
      if (subIndex > -1) {
        const component = data.components.map((su, i) => {
          if (subIndex == i && su.componentId == unit.unitId) {
            return Object.assign({}, su, { unit });
          }
          return su;
        });
        return Object.assign({}, data, { components: component });
      } else if (index == unitIndex) {
        return Object.assign({}, data, { unit });
      }
      return data;
    });

    this.unitWithMissingFields = updatedFields;
  }

  update() {
    const valid = this.isValid();
    if (!valid) {
      this.eventService.formErrorsObservable.next();
      return;
    }

    // Flat units
    const units = [];

    this.unitWithMissingFields.forEach((ud) => {
      const unit = ud.unit;

      // delete unit.subUnits;
      const { make } = unit;

      if (ud.provider?.length > 0 || ud.keys.length > 0) {
        const manufacturerBrandValue = (ud?.provider || []).find(
          (p) => p.name === TecAssuredField.ManufacturerBrand || p.name === TecAssuredField.Manufacturer || p.name === TecAssuredField.BoatManufacturer
        );
        units.push({ ...unit, additionalFields: ud.additionalFields, make: manufacturerBrandValue ? manufacturerBrandValue.value : make });
      }

      (ud.components || []).forEach((su) => {
        if (su.keys.length > 0) units.push({ ...su.unit, additionalFields: ud.additionalFields });
      });
    });
    this.close(true, units);
  }

  close(result = false, units: Unit[] = []) {
    this.dialogRef.close({ result, units });
  }

  isValid(): boolean {
    return this.form.valid && this.childComponents.toArray().every((c) => c.form.valid);
  }
  // Update provider customer fields in additionalFields parameter
  fieldChanged(event: ProviderCustomFieldDetails) {
    const { value, unitId, fieldName, providerIndex, providerId } = event;
    if (fieldName === TecAssuredField.ManufacturerBrand || fieldName === TecAssuredField.Manufacturer || fieldName === TecAssuredField.BoatManufacturer) return;
    const updatedFields = this.unitWithMissingFields.map((data) => {
      const additionalField = {
        value,
        name: fieldName,
        providerId,
      };
      if (data.unitId === unitId) {
        data.additionalFields[providerIndex] = additionalField;
      }
      return data;
    });

    this.unitWithMissingFields = updatedFields;
  }
  mainTrackBy(_index: number, item: DealRateUnitValidation) {
    return item.unitId;
  }

  trackBy(_index: number, item: DealRateUnitComponentValidation) {
    return item.componentId;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
