import { Component, OnInit, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectBoxComponent } from '../../modals/select-box/select-box.component';
import { ModalParams, ExclusiveChoice } from '../../modals/modal-params';

export interface GridItem {
  header: boolean;
  visible: boolean;
  selected: boolean;
  row: number;
  col: number;
  content: any;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnChanges {
  // @HostListener("contextmenu", ["$event"])
  //  onRightClick(event: any) {
  //   event.preventDefault();
  //   console.log(event);
  //  }
  @Input() gridContent: Array<Array<string>> | undefined;
  public gridHeader = new Array<GridItem>();
  public selectedCols = new Array<number>();
  public gridCols = new Array<Array<GridItem>>();
  public gridRows = new Array<Array<GridItem>>();
  public tableOn = false;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.build(changes['gridContent'].currentValue);
  }

  public build(gridContent: Array<Array<string>>): void {
    if (!gridContent || gridContent.length <= 0) {
      return;
    }
    this.tableOn = false;

    let header = gridContent[0];
    let table = gridContent.slice(1);

    for (let i = 0; i < header.length; i++) {
      let gridItem: GridItem = { header: true, visible: true, selected: false, row: 0, col: i, content: header[i] };
      this.gridHeader.push(gridItem);
      this.gridCols[i] = new Array<GridItem>();
      this.gridCols[i][0] = gridItem;
    }

    for (let r = 0; r < table.length; r++) {
      this.gridRows[r] = new Array<GridItem>();
      for (let c = 0; c < table[r].length; c++) {
        let gridItem: GridItem = { header: false, visible: true, selected: false, row: r, col: c, content: table[r][c] };
        this.gridCols[c][r] = gridItem;
        this.gridRows[r][c] = gridItem;
      }
    }

    this.tableOn = true;
  }

  public displayMenu(h: GridItem) {
    let params: ModalParams = {
      choices: [
        { text: 'Select', value: 0 },
        { text: 'Unselect', value: 1 },
        { text: 'Delete', value: 2 }
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
          default:
            break;
        }
        ref.componentInstance.emitter.unsubscribe();
      }
    );

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
  }

}
