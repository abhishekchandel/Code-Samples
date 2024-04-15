import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BaseDialogComponent } from '@project/base';
import {
  Coverage,
  CoverageItem,
  CustomerCostAmountType,
  DeductibleTextType,
  DeductibleType,
  MaxValue,
  NoSurchargeApplyId,
  Option,
  PaymentTaxCalcRequest,
  Permission,
  ProductDoc,
  RatedSurcharge,
  RatingType,
  Surcharge,
  TermFrequency,
  TermType,
  determineCoverageItem,
} from '@project/entities';
import { MileagePipe, TermPipe } from '@project/shared/pipes';
import { SnackbarService, UtilityService } from '@project/shared/services';
import { CustomConfirmationDialogComponent } from '@project/shared/ui';
import { Subscription } from 'rxjs';
import { MenuProduct, Product } from '../../../models';
import { MenuFacade } from '../../../state';

interface ModalDetails {
  termType: TermType;
  daysToFirstPayment: number;
  deliveryDate: Date;
  isFinanceDeal: boolean;
  product: Product;
  termFrequency: TermFrequency;
}
@Component({
  selector: 'project-rated-product-detail-dialog',
  templateUrl: './rated-product-detail-dialog.component.html',
  styleUrls: ['./rated-product-detail-dialog.component.scss'],
  providers: [MenuFacade, UtilityService, TermPipe, MileagePipe],
})
export class RatedProductDetailDialogComponent extends BaseDialogComponent implements OnInit, OnDestroy {
  @ViewChild('form') override form: NgForm;

  readonly CSOType = RatingType.CSO;
  readonly noSurchargeApplyId = NoSurchargeApplyId;

  ratedProduct = new MenuProduct();
  product: Product;
  productDocs: ProductDoc;
  showDealerCostAmount = false;
  paymentAmount: number;
  oldCustomerCost: number;

  totalTaxAmount: number;
  maxSellingPrice: number;

  coverageOptions: Option[];
  durationTermsOptions: Option[];
  mileageTermsOptions: Option[];
  deductiblesOptions: Option[];
  items: CoverageItem[] = [];
  surcharges: Surcharge[] = [];
  coverages: Coverage[] = [];
  paymentCalcRequest: PaymentTaxCalcRequest[] = [];

  override subscription = new Subscription();
  readonly AvailablePermissions = Permission;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalDetails,
    public override dialogRef: MatDialogRef<CustomConfirmationDialogComponent>,
    private menuFacade: MenuFacade,
    private termPipe: TermPipe,
    private mileagePipe: MileagePipe,
    public utilityService: UtilityService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    const { product } = this.data;
    this.product = product;

    this.subscription.add(
      this.menuFacade.productDetailsVm$.subscribe(({ ratedProduct, coverages, docs }) => {
        const { dealProductId } = this.product;
        if (ratedProduct) {
          const { deductibleType, deductible, term } = ratedProduct;
          this.ratedProduct = {
            ...ratedProduct,
            dealProductId,
            term: !term ? MaxValue.Term : term,
            deductible,
            deductibleValue: `${deductible}:${deductibleType ?? 0}`,
          };
          this.totalTaxAmount = ratedProduct.totalTaxAmount;
        }
        if (coverages?.length > 0) {
          this.productDocs = docs.length > 0 ? docs[0] : null;
          this.coverages = coverages;
          this.bindDropdownOptions();
          this.fieldsChanged(false);
        }
      })
    );

    this.getProductDetails(this.product?.dealProductId);
    if (this.data.isFinanceDeal) this.getPaymentCalcRequest();
  }

  bindDropdownOptions() {
    this.coverageOptions = this.coverages.map((coverage) => ({ text: coverage.name, value: coverage.id }));
    const selectedCoverage = this.coverages.find((x) => x.id == this.ratedProduct.coverageId);
    if (selectedCoverage) {
      const { items } = selectedCoverage;
      this.getDurationTermsOptions(selectedCoverage);

      this.items = items;
    }
  }

  // Bind the mileage terms dropdown
  private initialMileageTermsDropdown() {
    const { term, mileage } = this.ratedProduct;
    const filteredDurationItems = this.items.filter((item) => (term == MaxValue.Term ? !item.durationTerm : item.durationTerm == term));
    const durationTerms = filteredDurationItems.length == 0 ? [null] : filteredDurationItems;
    const mileageTerms = durationTerms.map((mileage) => {
      return {
        text: this.mileagePipe.transform(mileage?.mileageTerm, true),
        value: mileage?.mileageTerm == null ? MaxValue.Mileage : mileage.mileageTerm,
      };
    });

    this.mileageTermsOptions = this.utilityService.removeDuplicates(mileageTerms, 'value');

    // Update the mileageTerm
    const defaultMileage = mileage == MaxValue.Mileage ? mileage : Number(this.mileageTermsOptions[0].value);
    this.ratedProduct = { ...this.ratedProduct, mileage: defaultMileage };
  }

  coverageChange() {
    this.selectedCoverage();
    const { paymentTerms } = this.product;
    const term = (paymentTerms || []).find((t) => t.isSelected)?.term || 0;
    if (this.items.length > 0) {
      const durationTerms = this.durationTermsOptions.map((d) => +d.value);
      const item = determineCoverageItem(this.items, durationTerms, term, this.data.termType);
      const { id, durationTerm, mileageTerm, deductible, deductibleType } = item;
      const coverage = this.coverageOptions.find((p) => p.value == this.ratedProduct.coverageId);

      this.ratedProduct = {
        ...this.ratedProduct,
        coverageName: coverage.text,
        coverageItemId: id,
        term: durationTerm || MaxValue.Term,
        mileage: mileageTerm || MaxValue.Mileage,
        deductible,
        deductibleType,
      };
      this.fieldsChanged();
    }
  }
  private getExistingSurcharges(surcharges: Surcharge[]): RatedSurcharge[] {
    const ratingSurcharges = this.ratedProduct.surcharges;
    return surcharges
      .filter((surcharges) => ratingSurcharges.some((charge) => surcharges.name === charge.name))
      .map((s) => {
        return {
          ...s,
          costPrice: s.costPrice ?? 0,
          sellingPrice: s.sellingPrice ?? 0,
        };
      });
  }

  fieldsChanged(isUserChanged = true, isDeductibleChange = false) {
    this.initialMileageTermsDropdown();
    this.initialDeductibleDropdown(isDeductibleChange);
    if (this.ratedProduct && this.items) {
      const item = this.filteredCoverageItems();

      const {
        customerCostAmount,
        totalCustomerCostAmount,
        dealerCostAmount,
        totalDealerCostAmount,
        maxCustomerCostAmount,
        surcharges,
        paymentAmount,
        deductible,
        deductibleType,
        termType,
      } = item || {
        surcharges: [],
      };

      let selectedSurchargesIds = [];
      let existingSurcharges: RatedSurcharge[];

      if (isUserChanged) {
        existingSurcharges = this.getExistingSurcharges(surcharges);

        selectedSurchargesIds = existingSurcharges.map((r) => r.id);
        this.ratedProduct = {
          ...this.ratedProduct,
          sellingPrice: customerCostAmount,
          totalSellingPrice: totalCustomerCostAmount,
          costPrice: dealerCostAmount,
          totalCostPrice: totalDealerCostAmount,
          maxSellingPrice: maxCustomerCostAmount,
          msrp: maxCustomerCostAmount,
          deductible,
          deductibleType,
          termType,
        };
      } else {
        selectedSurchargesIds = this.ratedProduct.surcharges.map((s) => s.code);
        existingSurcharges = this.ratedProduct.surcharges.map((s) => {
          const surcharge = surcharges.find((sc) => sc.id === s.code);
          if (surcharge) s.isDisabled = surcharge.isDisabled;
          return s;
        });
      }

      this.surcharges = surcharges.map((s) => {
        return Object.assign({}, s, { isSelected: selectedSurchargesIds.includes(s.id) || s.isSelected });
      });

      // Update deductibleType & surcharges
      this.ratedProduct = { ...this.ratedProduct, surcharges: existingSurcharges, deductibleType };

      this.oldCustomerCost = customerCostAmount;
      this.paymentAmount = paymentAmount;

      // Check maxCustomerCostAmount if maxCustomerCostType is Fixed
      if (!this.isMaxIncludingSurcharges) {
        this.maxSellingPrice = this.ratedProduct.maxSellingPrice + this.surchargeTotalCustomerCost();
      } else {
        this.maxSellingPrice = this.ratedProduct.maxSellingPrice;
      }
    }
    // Update customerCost on field change
    this.updateCustomerCost();
  }

  updateCustomerCost() {
    const surchargeTotalCC = this.surchargeTotalCustomerCost();
    const oldSurchargeTotalCC = this.oldSurchargeTotalCustomerCost();

    const surchargeTotalDC = this.surchargeTotalDealerCost();
    const oldSurchargeTotalDC = this.oldSurChargeTotalDealerCost();
    const selectedSurcharges = this.surcharges.filter((s) => s.isSelected);

    const { totalSellingPrice, totalCostPrice } = this.ratedProduct;

    this.ratedProduct = {
      ...this.ratedProduct,
      totalCostPrice: totalCostPrice + surchargeTotalDC - oldSurchargeTotalDC,
      totalSellingPrice: totalSellingPrice + surchargeTotalCC - oldSurchargeTotalCC,
      surcharges: this.surchargesMap(selectedSurcharges),
    };

    // Updating the maxSelling price if customerCostAmount type is fixed
    if (!this.isMaxIncludingSurcharges) {
      this.maxSellingPrice = this.maxSellingPrice + surchargeTotalCC - oldSurchargeTotalCC;
    }
    this.getPaymentCalcRequest();
    this.calculateTax();
  }

  private surchargesMap(surcharges: Surcharge[]): RatedSurcharge[] {
    return surcharges.map((s) => {
      return {
        name: s.name,
        description: s.description,
        costPrice: s.dealerCostAmount,
        sellingPrice: s.customerCostAmount,
        isSelected: s.isSelected,
        code: s.id,
        isDisabled: s.isDisabled,
      };
    });
  }
  surchargeTotalCustomerCost() {
    return this.surcharges
      .filter((s) => s.isSelected && !s.isDisabled)
      .reduce((total, current) => total + (current.customerCostAmount ?? current.dealerCostAmount), 0);
  }

  surchargeTotalDealerCost() {
    return this.surcharges.filter((s) => s.isSelected && !s.isDisabled).reduce((total, current) => total + current.dealerCostAmount, 0);
  }

  oldSurchargeTotalCustomerCost() {
    const { surcharges } = this.ratedProduct;
    const oldSurcharges = surcharges.filter((s) => s.isSelected && !s.isDisabled).reduce((total, current) => total + (current.sellingPrice ?? current.costPrice), 0);
    return oldSurcharges || 0;
  }

  oldSurChargeTotalDealerCost() {
    const { surcharges } = this.ratedProduct;
    const oldSurcharges = surcharges.filter((s) => s.isSelected && !s.isDisabled).reduce((total, current) => total + current.costPrice, 0);
    return oldSurcharges || 0;
  }

  toggleSurcharge() {
    const updateSurcharges = this.surcharges.map((sc) => {
      if (this.disabledNoSurchargeApplyOptions) {
        if (sc.id == NoSurchargeApplyId) {
          return Object.assign({}, sc, { isSelected: false });
        }
      }
      return sc;
    });
    this.surcharges = updateSurcharges;
    this.updateCustomerCost();
  }

  override handleFormSubmit() {
    if (!this.hasSurcharges) {
      const message = this.translateService.instant('deal.worksheet.protectionProducts.warningMessages.selectAtLeastOneSurcharge');
      this.snackbarService.warning(message);
      return;
    }
    this.ratedProduct.totalTaxAmount = this.ratedProduct.isTaxAmountOverridden ? this.ratedProduct.totalTaxAmount : null;
    const payload = { ...this.ratedProduct };
    if (!this.form.valid) return;
    if (this.form.dirty) {
      this.menuFacade.updateRatedProduct(payload);
    } else {
      this.close();
    }
  }

  // Bind the deductible field dropdown
  private initialDeductibleDropdown(isUserChanged = false) {
    const { term, mileage, deductible, deductibleType, deductibleValue } = this.ratedProduct;

    const filteredDeductibleTerms =
      this.items.filter((item) => (item.durationTerm == term || term === MaxValue.Term) && (item.mileageTerm === mileage || mileage === MaxValue.Mileage)) || [];
    const deductibles = filteredDeductibleTerms
      .filter((d) => d?.deductible || d?.deductible === 0)
      .map((d) => {
        const amount = this.utilityService.formatAmount(d.deductible);
        const deductibleTextType = d.deductibleType ? `(${DeductibleTextType[d.deductibleType]})` : '';
        return {
          text: d.deductibleType != DeductibleType.Normal ? `${amount} ${deductibleTextType}` : amount,
          value: `${d.deductible}:${d.deductibleType ?? DeductibleType.Normal}`,
        };
      });
    this.deductiblesOptions = this.utilityService.removeDuplicates(deductibles, 'text');

    // Update the deductible
    const hasDeductibleOption = this.deductiblesOptions.length > 0;
    const defaultAmount = deductible != null ? deductible : hasDeductibleOption ? Number(this.deductiblesOptions[0].value.toString().split(':').pop()) : null;
    const value = deductible > -1 ? `${deductible}:${deductibleType ?? 0}` : hasDeductibleOption ? this.deductiblesOptions[0].value : '0.0';
    this.ratedProduct = { ...this.ratedProduct, deductible: defaultAmount, deductibleValue: isUserChanged ? deductibleValue : value.toString() };
  }

  private filteredCoverageItems() {
    const { term, mileage, deductibleValue } = this.ratedProduct;
    const deductibleValueArray = (deductibleValue || '').split(':');
    const [deductible, deductibleType] = deductibleValueArray;
    return this.items.find(
      (x) =>
        (x.durationTerm == null || x.durationTerm == term) &&
        (x.mileageTerm == null || x.mileageTerm == mileage) &&
        (x.deductible == null ||
          deductibleValueArray.length == 0 ||
          (x.deductible == Number(deductible) && ((!x.deductibleType && x.deductibleType != 0) || x.deductibleType == Number(deductibleType))))
    );
  }

  private getPaymentCalcRequest() {
    this.paymentCalcRequest = [];
    const { paymentTerms } = this.product;
    const { term } = this.ratedProduct;

    if (paymentTerms && paymentTerms.length > 0) {
      paymentTerms.forEach((paymentTerm) => {
        this.paymentCalcRequest.push({
          term: paymentTerm.term,
          interestRate: paymentTerm.interestRate,
          ...this.paymentCalc(),
        });
      });
    } else {
      // handled payment calculation if product is limited lifetime
      this.paymentCalcRequest.push({
        term: term,
        ...this.paymentCalc(),
      });
    }
  }

  paymentCalc() {
    return {
      daysToFirstPayment: this.data.daysToFirstPayment,
      termFrequency: this.data.termFrequency,
      deliveryDate: this.data.deliveryDate,
      totalTaxRate: this.ratedProduct.totalTaxRate || 0,
      totalTaxAmount: this.ratedProduct.totalTaxAmount || 0,
      isTaxAmountOverridden: this.ratedProduct.isTaxAmountOverridden,
    };
  }

  private selectedCoverage() {
    const coverage = this.coverages.find((x) => x.id == this.ratedProduct.coverageId);
    this.getDurationTermsOptions(coverage);
    const { items } = coverage;
    this.items = items;
  }

  private getDurationTermsOptions(selectedCoverage: Coverage) {
    const { durationTerms, items } = selectedCoverage;
    let durationTermsData: Option[];
    if (durationTerms.length === 0) {
      durationTermsData = [
        {
          text: this.termPipe.transform(null),
          value: MaxValue.Term,
        },
      ];
    } else {
      durationTermsData = items.map((term) => {
        return {
          text: this.termPipe.transform(term?.durationTerm, term?.termType),
          value: term?.durationTerm == null ? MaxValue.Term : term?.durationTerm,
        };
      });
    }

    this.durationTermsOptions = this.utilityService.removeDuplicates(durationTermsData, 'value');
  }
  private getProductDetails(dealProductId: number) {
    this.menuFacade.getProductDetails(dealProductId);
  }

  override close(value = false) {
    this.dialogRef.close(value);
  }

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  trackBy(_index: number, item: Surcharge) {
    return item.id;
  }

  customerCostChange() {
    const { isTaxAmountOverridden } = this.ratedProduct;
    if (!isTaxAmountOverridden) {
      this.calculateTotalTaxAmount();
      this.ratedProduct.totalTaxAmount = null;
    }
    this.getPaymentCalcRequest();
  }

  totalTaxRateChange() {
    const { isTaxAmountOverridden } = this.ratedProduct;
    if (!isTaxAmountOverridden) {
      this.calculateTotalTaxAmount();
      this.ratedProduct.totalTaxAmount = null;
    }
    this.getPaymentCalcRequest();
  }

  totalTaxAmountChange(totalTaxAmount: number) {
    this.totalTaxAmount = totalTaxAmount;
    this.ratedProduct.totalTaxAmount = totalTaxAmount;
    this.getPaymentCalcRequest();
  }

  toggleTaxAmountOverridden(isTaxAmountOverridden: boolean) {
    if (isTaxAmountOverridden) {
      this.ratedProduct.totalTaxRate = null;
    } else {
      this.calculateTotalTaxAmount();
    }
    this.getPaymentCalcRequest();
  }

  calculateTotalTaxAmount() {
    const { totalSellingPrice, totalTaxRate } = this.ratedProduct;
    if (totalTaxRate > -1) this.totalTaxAmount = (totalSellingPrice * totalTaxRate) / 100;
    else this.totalTaxAmount = null;
  }

  calculateTax() {
    const { totalSellingPrice, totalTaxRate, isTaxAmountOverridden } = this.ratedProduct;
    if (!isTaxAmountOverridden) {
      if (totalTaxRate) this.totalTaxAmount = (totalSellingPrice * totalTaxRate) / 100;
    }
  }

  ngOnDestroy(): void {
    this.menuFacade.resetProductDetails();
    this.subscription.unsubscribe();
  }

  get disabledNoSurchargeApplyOptions() {
    if (this.surcharges.length == 0) return false;
    return this.surcharges.some((s) => s.isSelected && s.id != NoSurchargeApplyId);
  }

  get hasSurcharges() {
    return this.surcharges.length > 0 ? this.surcharges.some((s) => s.isSelected) : true;
  }

  get totalCustomerCost() {
    return (this.totalTaxAmount || 0) + (this.ratedProduct.totalSellingPrice || 0);
  }
  get isMaxIncludingSurcharges() {
    return this.ratedProduct.maxCustomerCostAmountType === CustomerCostAmountType.MaxIncludingSurcharges;
  }

  get isCustomerCostFixed() {
    return this.ratedProduct.maxCustomerCostAmountType === CustomerCostAmountType.Fixed;
  }
}
