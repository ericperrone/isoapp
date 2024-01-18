import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectBoxComponent } from '../../modals/select-box/select-box.component';
import { ModalParams } from '../../modals/modal-params';
import { saveCsvFile } from '../../tools';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';
import { GeoModelService, GeoModel, EndMemberItem } from 'src/app/services/common/geo-model.service';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';

export interface GridItem {
  header: boolean;
  visible: boolean;
  selected: boolean;
  row: number;
  col: number;
  content: any;
  check: boolean;
  type: string;
}

export const EXPORT = '_EXPORT_';
const GRID_LOOP = '_GRID_LOOP_';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy, OnChanges {
  // @HostListener("contextmenu", ["$event"])
  //  onRightClick(event: any) {
  //   event.preventDefault();
  //   console.log(event);
  //  }
  @Input() gridContent: Array<Array<string>> | undefined;
  public dataset: Array<Array<string>> | undefined;
  public gridHeader = new Array<GridItem>();
  public selectedCols = new Array<number>();
  public selectedRowsIndex = new Array<number>();
  private originalHeader = new Array<string>();
  // public selectedRows = new Array<Array<GridItem>>(); 
  public gridCols = new Array<Array<GridItem>>();
  public gridRows = new Array<Array<GridItem>>();
  public screenRows = new Array<Array<GridItem>>();
  // public gridCacheCols = new Array<Array<GridItem>>();
  public gridCacheRows = new Array<Array<GridItem>>();
  public tableOn = false;
  public deleteFlag = false;
  private sub: Subscription | any;
  private subClose: Subscription | any;
  private ref: any;
  @ViewChild('maingrid') authlist: ElementRef | undefined;
  public limit = 60;
  public index = 0;
  public table = new Array<Array<string>>();
  public downOk = true;

  constructor(private modalService: NgbModal,
    private renderer: Renderer2,
    private eventGeneratorService: EventGeneratorService,
    private geoModelService: GeoModelService) { }

  ngOnInit(): void {
    this.sub = this.eventGeneratorService.on(EXPORT).subscribe(
      () => {
        if (!!this.gridHeader && this.gridHeader.length > 0) {
          saveCsvFile(this.buildCsv());
        }
      }
    );

    this.subClose = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => {
        if (!!this.ref) {
          this.ref.close();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
    if (!!this.subClose) {
      this.subClose.unsubscribe();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    this.downOk = true;
    this.dataset = changes['gridContent'].currentValue;
    this.build(changes['gridContent'].currentValue);
  }

  public build(gridContent: Array<Array<string>>): void {
    if (!gridContent || gridContent.length <= 0) {
      return;
    }
    this.tableOn = false;
    this.index = 0;
    this.reset();

    // let header = [ "", ...gridContent[0]];
    this.originalHeader = gridContent[0];
    let header = new Array<string>();
    for (let oh of this.originalHeader) {
      let p = oh.indexOf('\\');
      if (p > 0) {
        header.push(oh.substring(2));
      }
    }

    this.table = gridContent.slice(1);
    this.gridCols[0] = new Array<GridItem>();

    let initialSize = this.limit > this.table.length ? this.table.length : this.limit;

    for (let i = 0; i < header.length; i++) {
      let type = this.originalHeader[i].charAt(0);
      let gridItem: GridItem = { header: true, visible: true, selected: false, row: 0, col: i, content: header[i], check: false, type: type };
      this.gridHeader.push(gridItem);
      this.gridCols[i] = new Array<GridItem>();
      this.gridCols[i][0] = gridItem;
    }

    for (let r = 0; r < initialSize; r++) {
      this.gridRows[r] = new Array<GridItem>();
      this.screenRows[r] = new Array<GridItem>();
      for (let c = 0; c < this.table[r].length; c++) {
        let type = this.originalHeader[c].charAt(0);
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: this.table[r][c], check: false, type: type };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
        this.screenRows[r][c] = gridItem;
      }
    }

    for (let r = initialSize; r < this.table.length; r++) {
      this.gridRows[r] = new Array<GridItem>();
      for (let c = 0; c < this.table[r].length; c++) {
        let type = this.originalHeader[c].charAt(0);
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: this.table[r][c], check: false, type: type };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
      }
    }

    this.gridCacheRows = [...this.gridRows];
    this.tableOn = true;
  }

  public up(): void {
    this.tableOn = false;
    this.downOk = true;
    this.index -= this.limit;
    if (this.index < 0) {
      this.index = 0;
    }
    let size = this.index + this.limit;
    this.screenRows.length = 0;
    for (let r = this.index; r < size; r++) {
      this.screenRows[r - this.index] = this.gridCacheRows[r];
    }
    this.tableOn = true;
  }

  public down(): void {
    this.tableOn = false;
    this.index += this.limit;
    let size = this.index + this.limit;
    if (size > this.gridCacheRows.length) {
      size = this.gridCacheRows.length;
      this.downOk = false;
    }
    this.screenRows.length = 0;    
    for (let r = this.index; r < size; r++) {
      this.screenRows[r - this.index] = this.gridCacheRows[r];
    }
    this.tableOn = true;
  }

  private reset(): void {
    this.gridHeader = new Array<GridItem>();
    this.gridCols = new Array<Array<GridItem>>();
    this.gridRows = new Array<Array<GridItem>>();
    this.selectedCols = new Array<number>();
    this.selectedRowsIndex = new Array<number>();
  }

  public onCheck(gi: GridItem) {

    let found = -1;

    for (let i = 0; i < this.selectedRowsIndex.length; i++) {
      if (this.selectedRowsIndex[i] === gi.row) {
        found = i;
        break;
      }
    }

    this.tableOn = false;
    if (found < 0) {
      this.selectedRowsIndex.push(gi.row);
      for (let i = 0; i < this.gridRows[gi.row].length; i++) {
        this.gridRows[gi.row][i].selected = true;
      }
    } else {
      this.selectedRowsIndex.splice(found, 1);
      for (let i = 0; i < this.gridRows[gi.row].length; i++) {
        this.gridRows[gi.row][i].selected = false;
      }
    }
    this.tableOn = true;
  }

  public displayMenu(h: GridItem, event: any) {
    let params: ModalParams = {
      choices: [
        { text: 'Select row', value: 0 },
        { text: 'Deselect row', value: 1 },
        { text: 'Hide', value: 2 },
        { text: 'Select element', value: 4 },
        { text: 'Reset element selection', value: 5 },
      ]
    };

    let selected = false;

    for (let n of this.selectedCols) {
      if (n === h.col) {
        params.choices?.splice(0, 1);
        selected = true;
        break;
      }
    }

    if (selected === false) {
      params.choices?.splice(1, 1);
    }

    let ref = this.modalService.open(SelectBoxComponent, { centered: true, size: 'sm', scrollable: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: number) => {
        ref.close();
        switch (response) {
          case 0:
            this.selectCol(h);
            break;
          case 1:
            this.unselectCol(h);
            break;
          case 2:
            this.deleteCol(h);
            break;
          case 3:
            this.restoreAll();
            break;
          case 4:
            this.selectItem(h);
            break;
          case 5:
            this.deselectItem();
            break;
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      }
    );
  }

  public restoreAll(): void {
    if (!!this.dataset) {
      this.tableOn = false;
      this.build(this.dataset);
      this.tableOn = true;
      this.deleteFlag = false;
    }
  }

  private deselectItem(): void {
    this.gridCacheRows = [...this.gridRows];
    this.tableOn = false;
    this.screenRows.length = 0;
    for (let i = 0; i < this.limit; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }
    this.tableOn = true;
  }

  private selectCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].selected = true;
    for (let e of this.gridCols[h.col]) {
      e.selected = true;
    }
    this.tableOn = true;
    this.selectedCols.push(h.col);
  }

  private selectItem(h: GridItem): void {
    this.tableOn = false;

    let j = 0;
    let localCache = new Array<Array<GridItem>>();
    for (let i = 0; i < this.gridCacheRows.length; i++) {
      // console.log('[' + this.table[i][h.col] + ']');
      // if (this.table[i][h.col] && this.table[i][h.col].trim().length > 0) {
      if (this.gridCacheRows[i][h.col].content.length > 0) {  
        localCache[j] = this.gridCacheRows[i];
        j++;
      }
    }

    this.gridCacheRows.length = 0;
    for (let i = 0; i < localCache.length; i++) {
      this.gridCacheRows[i] = localCache[i];
    }

    console.log('this.gridCacheRows[]: ' + this.gridCacheRows.length);

    let length =  this.limit; 
    if (this.gridCacheRows.length <= this.limit) {
      length = this.gridCacheRows.length;
      this.downOk = false;
    }

    this.screenRows.length = 0;
    for (let i = 0; i < length; i++) {
      this.screenRows[i] = this.gridCacheRows[i];
    }

    this.tableOn = true;
  }

  private unselectCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].selected = false;
    for (let e of this.gridCols[h.col]) {
      e.selected = false;
    }
    this.tableOn = true;
    let helper = new Array<number>();
    for (let n of this.selectedCols) {
      if (n !== h.col) {
        helper.push(n);
      }
    }
    this.selectedCols = helper;
  }

  private deleteCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].visible = false;
    for (let e of this.gridCols[h.col]) {
      e.visible = false;
    }
    this.tableOn = true;
    this.deleteFlag = true;
  }

  private buildCsv(): string {
    let csv = '';
    for (let h of this.gridHeader) {
      if (h.visible === true) {
        csv += h.content + ';';
      }
    }
    csv += '\n';

    for (let r of this.gridRows) {
      for (let item of r) {
        if (item.visible === true) {
          csv += item.content + ';';
        }
      }
      csv += '\n';
    }
    return csv;
  }

  public use(): void {
    let members = new Array<Array<EndMemberItem>>();
    for (let s of this.selectedRowsIndex) {
      let row = this.gridRows[s];
      let member = new Array<EndMemberItem>();
      for (let c of row) {
        if (c.visible)
          member.push({ type: c.type, name: this.gridHeader[c.col].content, value: '' + c.content });
      }
      members.push(member);
    }

    let params: ModalParams = {
      choices: [
        { text: 'Mixing model', value: 0, icon: 'fa-solid fa-flask' },
        { text: 'Crystallization mass balance', value: 1, icon: 'fa-brands fa-codepen' },
        { text: 'Melting', value: 2, icon: 'fa-solid fa-dice-d20' },
      ]
    };

    let ref = this.modalService.open(SelectBoxComponent, { centered: true, size: 'sm', scrollable: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      (response: number) => {
        ref.close();
        switch (response) {
          case 0:
            this.geoModelService.setModel({ selectedModel: 0, endMembers: members });
            this.ref = this.geoModelService.execute();
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            break;
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      }
    );
  }
}
