import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { StoreService } from 'src/app/services/common/store.service';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-content-manager',
  templateUrl: './content-manager.component.html',
  styleUrls: ['./content-manager.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ContentManagerComponent extends DataGathering implements OnInit, OnDestroy {
  public selectedRow = ['\/'];
  public spinnerOn = false;
  public showContent = false;
  public sheet: string = '';
  public content: Array<Array<string>> | undefined; // = new Array<Array<string>>();
  public pages: Array<Array<Array<string>>> = new Array<Array<Array<string>>>();
  private rowPerPage = 40;
  public pageIndex = 0;
  private subscription: Subscription | undefined;

  constructor(private router: Router,
    private storeService: StoreService,
    private cookieService: CookieService,
    private dataProcessingService: DataProcessingService) {
    super();
  }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);

    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        let key = this.cookieService.get('xkey');
        const su = this.dataProcessingService.releaseContent(key).subscribe(
          (r) => {
            this.cookieService.delete('xkey');
            su.unsubscribe();
          }
        );
      }
    });

    if (!session || !session.selectedSheet) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.sheet = session.selectedSheet;
      this.session = session;
      if (this.sheet.length > 0)
        this.loadContent();
    }

  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadContent(): void {
    if (!this.session.content) {
      this.spinnerOn = true;
      let s = this.dataProcessingService.getContentXlsx(this.sheet, this.session.key).subscribe(
        (data) => {
          if (typeof data === 'string') {
            s.unsubscribe();
            this.spinnerOn = false;
            alert(data);
            return;
          }
          this.content = data;
          s.unsubscribe();
          this.formatContent();
          this.session.content = this.content;
          this.storeService.push({ key: DATA_GATHERING, data: this.session });
          this.paginateContent();
          this.spinnerOn = false;
          if (!!this.session.header) {
            this.selectedRow = this.session.header;
          }

          const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
            (r) => {
              console.log(r);
              su.unsubscribe();
            }
          );
        }

      );
    } else {
      this.session = this.storeService.get(DATA_GATHERING);
      this.content = this.session.content;
      this.paginateContent();
      if (!!this.session.header) {
        this.selectedRow = this.session.header;
      }
    }
  }

  private formatContent() {
    let maxCols = 0;
    if (!this.content)
      return;
    for (let row of this.content) {
      maxCols = row.length > maxCols ? row.length : maxCols;
    }

    for (let row of this.content) {
      if (row.length < maxCols) {
        for (let i = row.length; i < maxCols; i++) {
          row.push('');
        }
      }
    }

    this.deleteEmptyCols();
  }

  private deleteEmptyCols() {
    if (!this.content)
      return;
    let maxCols = this.content[0].length;
    let maxRows = this.content.length;
    let toEliminate = [];

    for (let j = 0; j < maxCols; j++) {
      toEliminate[j] = 0;
    }

    for (let i = 0; i < maxRows; i++) {
      for (let j = 0; j < maxCols; j++) {
        if (this.content[i][j].length === 0) {
          toEliminate[j]++;
        }
      }
    }

    for (let i = 0; i < maxRows; i++) {
      let newRow = [];
      for (let j = 0; j < maxCols; j++) {
        if (toEliminate[j] < maxRows) {
          newRow.push(this.content[i][j]);
        }
      }
      this.content[i] = newRow;
    }
  }

  private paginateContent() {
    if (!this.content)
      return;
    this.pageIndex = 0;
    this.pages[this.pageIndex] = new Array<Array<string>>();
    for (let i = 0, j = 0; i < this.content.length; i++) {
      let row = this.content[i];
      if (j < this.rowPerPage) {
        this.pages[this.pageIndex].push(row);
        j++;
      } else {
        this.pageIndex++;
        this.pages[this.pageIndex] = new Array<Array<string>>();
        this.pages[this.pageIndex].push(row);
        j = 1;
      }
    }
    this.pageIndex = 0;
    this.showContent = true;
  }

  public next(): void {
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
    }
  }

  public previous(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  public first(): void {
    this.pageIndex = 0;
  }

  public last(): void {
    this.pageIndex = this.pages.length - 1;
  }

  public selectRow(row: Array<string>) {
    this.selectedRow = row;
  }

  public checkSelected(row: Array<string>): boolean {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== this.selectedRow[i])
        return false;
    }
    return true;
  }

  public goPrevious(): void {
    this.router.navigate(['file-process']);
  }

  public goNext(): void {
    if (this.selectedRow.length < 2)
      return;
    this.session.header = this.selectedRow;
    this.session.headerPosition = this.saveTableHeader();
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
    this.router.navigate(['content-manager2']);
  }

  private saveTableHeader(): number {
    if (this.selectedRow.length > 1 && !!this.session.content) {
      for (let i = 0; i < this.session.content?.length - 1; i++) {
        let found = true;
        for (let j = 0; j < this.selectedRow.length; j++) {
          if (this.session.content[i][j] !== this.selectedRow[j]) {
            found = false;
            break;
          }
        }
        if (found === true)
          return i;
      }
    }
    return -1;
  }

}
