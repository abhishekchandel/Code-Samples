import { Component, HostListener, Input } from '@angular/core';
import { Option } from '@entities';
import { ModalService, SnackbarService } from '@shared/services';
import { Column, CopyMoveProductRequest, MenuFacade, Product } from '@store/menu';
import { ManualProductDetailDialogComponent, RatedProductDetailDialogComponent } from '../dialogs';

@Component({
  selector: 'menu-card',
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss'],
})
export class MenuCardComponent {
  @Input() product: Product;
  @Input() termFrequency: number;
  @Input() deliveryDate: Date;
  @Input() daysToFirstPayment: number;
  @Input() dealId: number;
  @Input() showCostPrice = false;
  @Input() showPayment = false;
  @Input() isFinanceDeal = false;
  @Input() isCustom = false;
  @Input() isCustomColumnVisible = false;
  @Input() columnList: Column[];
  @Input() name: string;
  @Input() isCustomerView = false;
  isShowEditButton = false;
  customOptionEnabled = false;
  columnOptions: Option[] = [];
  disableCustomColumnOption = false;
  showCardDetail = false;

  isEditProductEnable$ = this.menuFacade.isEditProductEnable$;
  constructor(private modalService: ModalService, private snackbarService: SnackbarService, private menuFacade: MenuFacade) {}

  showHideDetail() {
    this.showCardDetail = !this.showCardDetail;
  }

  deleteProduct(columnName: string, dealProductId: number) {
    this.menuFacade.removeCustomProduct(columnName, dealProductId);
  }

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  editProduct() {
    const { isRated } = this.product;
    if (isRated) {
      this.openRatedProductDialog();
    } else {
      this.openManualProductDialog();
    }
  }

  private openRatedProductDialog() {
    const data = {
      termFrequency: this.termFrequency,
      daysToFirstPayment: this.daysToFirstPayment,
      deliveryDate: this.deliveryDate,
      isFinanceDeal: this.isFinanceDeal,
      product: { ...this.product, isFinanceDeal: this.isFinanceDeal },
    };
    this.modalService.open(RatedProductDetailDialogComponent, data, 'modal-md');
  }

  private openManualProductDialog() {
    const data = {
      termFrequency: this.termFrequency,
      daysToFirstPayment: this.daysToFirstPayment,
      deliveryDate: this.deliveryDate,
      isFinanceDeal: this.isFinanceDeal,
      product: { ...this.product, isFinanceDeal: this.isFinanceDeal },
    };

    this.modalService.open(ManualProductDetailDialogComponent, data, 'modal-md');
  }

  buildMenu() {
    const options = [];
    for (const column of this.columnList) {
      if (column.name == this.name) continue;
      let isExist = false;
      const exist = column.products.findIndex((x) => x.dealProductId === this.product.dealProductId) > -1;
      if (exist) isExist = true;

      if (column.isCustom) {
        this.customOptionEnabled = true;
        this.disableCustomColumnOption = exist;
        continue;
      }

      options.push({
        text: column.name,
        value: column.name,
        isDisabled: isExist,
      });
    }

    this.columnOptions = [...options];
  }

  clearMenu() {
    this.customOptionEnabled = false;
    this.disableCustomColumnOption = false;
    this.columnOptions = [];
  }

  copyOrMoveProduct(columnName: string, isMoveAction = false) {
    const column = this.columnList.find((x) => x.name === columnName);
    const index = column.products.findIndex((x) => x.dealProductId === this.product.dealProductId);
    if (index > -1) {
      this.snackbarService.multipleErrors({ title: 'common.error', message: 'menu.errorMessage.productExist' });
      return;
    }

    const data: CopyMoveProductRequest = {
      product: this.product,
      columnToCopyOrMove: columnName,
      moveColumn: isMoveAction,
    };

    if (isMoveAction) this.menuFacade.moveProduct(data);
    else this.menuFacade.copyProduct(data);

    setTimeout(() => {
      document.getElementById(`column-${columnName}`).scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
    }, 100);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
      event.preventDefault();
      this.isShowEditButton = !this.isShowEditButton;
    }
  }

  get isShowEditVisible() {
    return !this.isCustomerView || this.isShowEditButton;
  }
}