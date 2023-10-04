import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectBoxComponent } from '../../modals/select-box/select-box.component';
import { ModalParams } from '../../modals/modal-params';
import { saveCsvFile } from '../../tools';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';
import { GeoModelService } from 'src/app/services/common/geo-model.service';

export interface GridItem {
  header: boolean;
  visible: boolean;
  selected: boolean;
  row: number;
  col: number;
  content: any;
  check: boolean;
}

export const EXPORT = '_EXPORT_';

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
  public tableOn = false;
  public deleteFlag = false;
  private sub: Subscription | any;

  constructor(private modalService: NgbModal,
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
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    this.dataset = changes['gridContent'].currentValue;
    this.build(changes['gridContent'].currentValue);
  }

  public build(gridContent: Array<Array<string>>): void {
    if (!gridContent || gridContent.length <= 0) {
      return;
    }
    this.tableOn = false;
    
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

    let table = gridContent.slice(1);
    // for (let r = 0; r < table.length; r++) {
    //   table[r] = ["", ...table[r]];
    // }

    // let gridItem: GridItem = { header: true, visible: true, selected: false, row: 0, col: 0, content: header[0], check: true };
    // this.gridHeader.push(gridItem);
    this.gridCols[0] = new Array<GridItem>();
    // this.gridCols[0][0] = gridItem;

    for (let i = 0; i < header.length; i++) {
      let gridItem: GridItem = { header: true, visible: true, selected: false, row: 0, col: i, content: header[i], check: false };
      this.gridHeader.push(gridItem);
      this.gridCols[i] = new Array<GridItem>();
      this.gridCols[i][0] = gridItem;
    }

    for (let r = 0; r < table.length; r++) {
      this.gridRows[r] = new Array<GridItem>();
      // let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: 0, content: "", check: true };
      // this.gridCols[0][r] = gridItem;
      // this.gridRows[r][0] = gridItem;
    for (let c = 0; c < table[r].length; c++) {
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: table[r][c], check: false };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
      }
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

    for(let i = 0; i < this.selectedRowsIndex.length; i++) {
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
        { text: 'Select', value: 0 },
        { text: 'Unselect', value: 1 },
        { text: 'Delete', value: 2 },
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

  private selectCol(h: GridItem): void {
    this.tableOn = false;
    this.gridHeader[h.col].selected = true;
    for (let e of this.gridCols[h.col]) {
      e.selected = true;
    }
    this.tableOn = true;
    this.selectedCols.push(h.col);
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
            this.geoModelService.setModel({selectedModel: 0, endMembers: new Array<Array<string>>()});
            this.geoModelService.execute();
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
