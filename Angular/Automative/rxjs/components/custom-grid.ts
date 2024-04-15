import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { GridColumn, RoleType, SortDirection } from '@project/entities';
import { ObjectPropertyByKeyPipe } from '@project/shared/pipes';
import { UtilityService } from '@project/shared/services';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'project-mat-grid',
  templateUrl: './mat-grid.component.html',
  styleUrls: ['./mat-grid.component.scss'],
  providers: [ObjectPropertyByKeyPipe],
})
export class MatGridComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() loaded = false;
  @Input() data$: Observable<object[]>;
  @Input() sortColumn: string;
  @Input() sortDirection = SortDirection.Ascending;
  @Input() columns: Array<GridColumn>;
  @Input() isDashboard = false;

  @Input() allCheckboxChecked = false;
  @Input() disabledCheckbox = false;
  @Input() groupingColumn: string;
  @Output() checkAll = new EventEmitter<boolean>();

  // Row Details Properties
  @Input() detailRow?: TemplateRef<HTMLElement>;
  @Input() isRowDisabled: (data: object) => boolean;
  @Input() hideDetailRow: (data: object) => boolean;

  @Input() rowEventEnabled = false;
  @Input() sumOfColumnNames: string[] = [];
  @Input() displayMessage = 'common.noRecord';
  @Output() triggerRowEvent = new EventEmitter();
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() sumOfColumHandler: (key: string, data: object[]) => number;

  displayedColumns: string[];
  dataSource = new MatTableDataSource([]);
  tableData: object[] = [];
  private subscription = new Subscription();

  constructor(private objectPropertyByKeyPipe: ObjectPropertyByKeyPipe, private utilityService: UtilityService) {}

  ngOnInit() {
    if (this.columns) {
      this.displayedColumns = this.columns.filter((p) => !p.hideColumn).map((col) => col.name);
    }
  }
  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortChange(sort: Sort) {
    if (!this.groupingColumn) return;
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.customSortingHandle(sort);
  }

  //  Grouping of data by passing groupingColumn column name
  customSortingHandle(sort: Sort) {
    const groupHeadings = new Set(this.dataSource.data.filter((d) => d[this.groupingColumn]).map((data) => data[this.groupingColumn]));
    const groupingData = [];
    // Filter by type or base on passed value in groupingColumn
    groupHeadings.forEach((type) => {
      const typeData = this.dataSource.data
        .filter((d) => d[this.groupingColumn] === type)
        .sort((a, b) => {
          const isAsc = sort.direction === SortDirection.Ascending;
          return this.compare(a[sort.active], b[sort.active], isAsc);
        });
      groupingData.push(...typeData);
    });
    this.dataSource = new MatTableDataSource([]);
    const groupedItems = groupingData.reduce((group, item) => {
      const type = item[this.groupingColumn];
      group[type] = group[type] ?? [];
      group[type].push(item);
      return group;
    }, []);
    const updatedItems = [];
    // Add group title in table
    Object.keys(groupedItems).forEach((key) => {
      updatedItems.push({ groupName: key, isGroupBy: true });
      const values = groupedItems[key];
      if (key === RoleType.Custom) {
        values.sort((a, b) => {
          return b[sort.active] - a[sort.active];
        });
      }
      values.forEach((element) => {
        updatedItems.push(element);
      });
    });

    this.dataSource = new MatTableDataSource(updatedItems);
  }

  bindGrid() {
    this.subscription.add(
      this.data$.subscribe((data) => {
        this.tableData = data;
        this.dataSource = new MatTableDataSource(data);

        this.dataSource.sortingDataAccessor = (data: object, sortHeaderId: string) => {
          if (sortHeaderId.includes('.')) {
            return this.objectPropertyByKeyPipe.transform(data, sortHeaderId);
          }
          return data[sortHeaderId];
        };
        this.dataSource.sort = this.sort;
        if (this.groupingColumn) {
          this.customSortingHandle(this.sort);
        }
      })
    );
  }

  toggleHiddenColumns(show: boolean) {
    if (!this.columns) return;

    this.columns.forEach((c) => {
      if (c.hideColumn !== undefined) c.hideColumn = !show;
      return c;
    });

    if (show) {
      this.displayedColumns = this.columns.map((col) => col.name);
    } else {
      this.displayedColumns = this.columns.filter((p) => !p.hideColumn).map((col) => col.name);
    }
  }

  trackBy(_index: number, unit) {
    return unit.id;
  }

  ngAfterViewInit(): void {
    this.bindGrid();
  }

  toggleAllCheckbox(event) {
    this.checkAll.emit(event.checked);
  }

  rowClick(rowData) {
    if (this.rowEventEnabled) this.triggerRowEvent.emit(rowData);
  }

  sumOfGridColumn(key: string) {
    const totalVal = this.sumOfColumHandler ? this.sumOfColumHandler(key, this.tableData) : this.tableData.map((t) => t[key]).reduce((acc, value) => acc + value, 0);
    return this.utilityService.formatAmount(totalVal);
  }

  get noDataFound() {
    return this.dataSource.data.length == 0;
  }

  isGroup(_index, item): boolean {
    return item.isGroupBy;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
