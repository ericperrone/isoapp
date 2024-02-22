import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Series, DataSeries, DATA_SERIES, ChartShapes, DataSeriesPoint } from 'src/app/models/series';
import { StoreService } from 'src/app/services/common/store.service';
import { ModalParams, CANCEL, CONFIRM } from '../modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlottingComponent } from 'src/app/geo-modelling/plotting/plotting.component';
import { GridItem } from '../../components/grid/grid.component';
import { SampleService } from 'src/app/services/rest/sample.service';
import { DataGrid } from 'src/app/models/datagrid';
import { ConfirmComponent } from '../confirm/confirm.component';
import { List } from '../../list';

export interface Range {
  min: number;
  max: number;
}

export const RGBColors = [
  '#4F81BC', '#C0504E', '#9BBB58', '#23BFAA', '#8064A1', '#4AACC5', '#F79647', '#7F6084', '#77A033', '#33558B', '#E59566', '#FFA500'
];

@Component({
  selector: 'app-data-plotting-series',
  templateUrl: './data-plotting-series.component.html',
  styleUrls: ['./data-plotting-series.component.scss']
})
export class DataPlottingSeriesComponent implements OnInit {
  private grid: Array<Array<GridItem>> | undefined;
  public xyEdit: boolean = true;
  public chartWidth: number = 1400;
  public chartHeight: number = 850;
  public xOperator = '0';
  public yOperator = '0';
  public ChartShapes = ChartShapes;
  public pointButtonEnabled = false;
  public color = '';
  public name = '';
  public dataSeries: Series = { xAxis: '', yAxis: '', width: this.chartWidth, height: this.chartHeight, series: [] };
  public xAxis = new Array<string>();
  public yAxis = new Array<string>();
  public xData = new Array<number>();
  public yData = new Array<number>();
  public xSelected = '';
  public ySelected = '';
  public xSelected2 = '';
  public ySelected2 = '';
  public shape = 'circle';
  public xRange: Range = { min: -10000, max: 10000 };
  public yRange: Range = { min: -10000, max: 10000 };
  private xRangeBak: Range = { min: -10000, max: 10000 };
  private yRangeBak: Range = { min: -10000, max: 10000 };
  public xLog = false;
  public yLog = false;
  public selectedDataSeries: DataSeries | undefined;
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public dataGrid: DataGrid = new DataGrid(this.storeService);

  constructor(private storeService: StoreService,
    private sampleService: SampleService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    let ds = this.storeService.get(DATA_SERIES);
    if (!!ds) {
      this.dataSeries = ds;
      if (this.dataSeries.xAxis && this.dataSeries.xAxis.length > 0 && this.dataSeries.yAxis && this.dataSeries.yAxis.length > 0) {
        this.xSelected = this.dataSeries.xAxis;
        this.ySelected = this.dataSeries.yAxis;
        this.xyEdit = true;
      }
    } else {
      this.addDataSeries();
    }
    if (!!this.params && !!this.params.list) {
      console.log(this.params);
      this.dataGrid.add(this.params.anyParams.headers, this.params.anyParams.selection);
      this.dataGrid.persist();
      let list = this.dataGrid.getElementList();
      for (let item of list) {
        this.xAxis.push(item);
        this.yAxis.push(item);
      }
    }
  }

  public xOperatorChange(): void {
    if (this.xOperator === '1' || this.xOperator === '0') {
      this.selectedChange();
    }
  }

  public yOperatorChange(): void {
    if (this.yOperator === '1' || this.yOperator === '0') {
      this.selectedChange();
    }
  }

  public xLogHandler(): void {
    if (!!this.xLog) {
      this.xRangeBak = { ...this.xRange };
      if (this.xRange.min != 0) {
        this.xRange.min = Math.log10(this.xRange.min);
      }
      if (this.xRange.max != 0) {
        this.xRange.max = Math.log10(this.xRange.max);
      }
    } else {
      this.xRange = { ...this.xRangeBak };
    }
    this.setAxisNames();
  }

  public yLogHandler(): void {
    if (!!this.yLog) {
      this.yRangeBak = { ...this.yRange };
      if (this.yRange.min != 0) {
        this.yRange.min = Math.log10(this.yRange.min);
      }
      if (this.yRange.max != 0) {
        this.yRange.max = Math.log10(this.yRange.max);
      }
    } else {
      this.yRange = { ...this.yRangeBak };
    }
  }

  public selectedChange(): void {
    this.getXYAxis();
    this.reassignPointsToSeries();
  }

  // public xSelectedChange(): void {
  //   this.getXYAxis();
  //   this.reassignPointsToSeries();
  //   // this.getDataByIds();
  //   // this.xData = this.computeRange(this.xSelected, this.xOperator, this.xRange, (this.xOperator === '2' && this.xSelected2) ? this.xSelected2 : undefined);
  //   // this.reassignPointsToSeries();
  // }

  // public ySelectedChange(): void {
  //   this.getXYAxis();
  //   this.reassignPointsToSeries();
  //   // this.yData = this.computeRange(this.ySelected, this.yOperator, this.yRange, (this.yOperator === '2' && this.ySelected2) ? this.ySelected2 : undefined);
  //   // this.reassignPointsToSeries();
  // }

  // public xSelected2Change(): void {
  //   this.getXYAxis();
  //   this.reassignPointsToSeries();
  //   // this.xData = this.computeRange(this.xSelected, this.xOperator, this.xRange, (this.xOperator === '2' && this.xSelected2) ? this.xSelected2 : undefined);
  //   // this.reassignPointsToSeries();
  // }

  // public ySelected2Change(): void {
  //   this.getXYAxis();
  //   this.reassignPointsToSeries();
  //   // this.yData = this.computeRange(this.ySelected, this.yOperator, this.yRange, (this.yOperator === '2' && this.ySelected2) ? this.ySelected2 : undefined);
  //   // this.reassignPointsToSeries();
  // }

  // private computeRange(selected1: string, operator: string, range: Range, selected2?: string): number[] {
  //   switch (operator) {
  //     case '0':
  //     default:
  //       // return this.computeNormalRange(selected1, range);
  //     case '1':
  //       // return this.computeInverseRange(selected1, range);
  //     case '2':
  //       // return this.computeRatioRange(selected1, range, selected2);
  //   }
  // }

  // --------------------------------------------------------
  // IDEA: modificare la logica del pannello: PRIMA si assegnano
  // le righe alla serie (eventualmente appena creata), POI
  // si selezionano X e Y.
  // --------------------------------------------------------

  // --------------------------------------------------------
  // Si usa per assegnare le RIGHE provenienti dalla query
  // ad una serie.
  // --------------------------------------------------------
  public addRowsToCurrentSeries(): void {

  }

  // --------------------------------------------------------
  // Si deve agire su tutte le righe selezionate per le serie
  // e sulle colonne selezionate dalle select.
  // Il metodo viene richiamato quando si assegnano dei dati
  // alle serie.
  // --------------------------------------------------------

  private getFloatDataFromGrid(dataSeries: DataSeries): Array<DataSeriesPoint> {
    let points = new Array<DataSeriesPoint>();
    if (!!this.dataGrid && this.xSelected.length > 0 && this.ySelected.length > 0 && !!this.dataGrid.getGrid()) {
      this.grid = this.dataGrid.getGrid();
      let header = this.dataGrid.getHeader();
      for (let s of dataSeries.samples) {
        let row = this.dataGrid.getGridRowById(s);
        if (row) {
          let xCol = 0;
          let xValue = 0;
          let yValue = 0;
          xValue = this.getFloatValue(row, this.xSelected, this.xSelected2, this.xOperator);
          yValue = this.getFloatValue(row, this.ySelected, this.ySelected2, this.yOperator);
          if (xValue != 0 && yValue != 0) {
            if (this.xLog && xValue > 0) {
              xValue = Math.log10(xValue);
            }
            if (this.yLog && yValue > 0) {
              yValue = Math.log10(yValue);
            }
            points.push({ x: xValue, y: yValue });
          }
        }
      }
    }
    return points;
  }

  private getFloatValue(row: Array<GridItem>, select1: string, select2: string, operator: string): number {
    let col = 0;
    let value = 0;
    switch (operator) {
      default:
      case '0':
        col = this.dataGrid.getHeaderCol(select1);
        value = parseFloat(row[col].content);
        break;
      case '1':
        col = this.dataGrid.getHeaderCol(select1);
        value = parseFloat(row[col].content);
        value = 1 / value;
        break;
      case '2':
        if (select2.length > 0) {
          col = this.dataGrid.getHeaderCol(select1);
          value = parseFloat(row[col].content);
          let x2Col = this.dataGrid.getHeaderCol(select2);
          let x2Value = parseFloat(row[x2Col].content);
          if (x2Value !== 0)
            value = value / x2Value;
        }
    }
    return value;
  }

  private getXYAxis(): void {
    if (!!this.dataSeries && this.xSelected.length > 0 && this.ySelected.length > 0) {
      switch (this.xOperator) {
        default:
        case '0':
          this.dataSeries.xAxis = this.xSelected;
          break;
        case '1':
          this.dataSeries.xAxis = '1 / ' + this.xSelected;
          break;
        case '2':
          this.dataSeries.xAxis = this.xSelected + ' / ' + this.xSelected2;
      }
      switch (this.yOperator) {
        default:
        case '0':
          this.dataSeries.yAxis = this.ySelected;
          break;
        case '1':
          this.dataSeries.yAxis = '1 / ' + this.ySelected;
          break;
        case '2':
          this.dataSeries.yAxis = this.ySelected + ' / ' + this.ySelected2;
      }
      console.log(this.dataSeries);
    }
  }

  private reassignPointsToSeries(): void {
    for (let ds of this.dataSeries.series) {
      ds.data = new List<DataSeriesPoint>();
      let points = this.getFloatDataFromGrid(ds);
      for (let p of points) {
        ds.data.only1Push(p);
      }
    }
  }

  private getColumn(name: string): string[] {
    let column = new Array<string>();
    this.grid = this.dataGrid.getGrid();
    if (!!this.dataGrid && !!this.grid) {
      let headers = this.dataGrid.getHeader();
      let selection = new Array<Array<GridItem>>();
      let selectedRows = this.dataGrid.getSelectedRows();

      for (let sel of selectedRows) {
        selection.push(this.grid[sel]);
      }
      console.log(selection);

      if (!!headers) {
        let hx = -1;
        for (let h of headers) {
          if (h.content === name) {
            hx = h.col;
            break;
          }
        }

        if (hx > 0) {
          for (let x of selection) {
            column.push(x[hx].content);
          }
        }
      }
    }

    return column;
  }


  public addDataSeries(): void {
    if (!!this.dataSeries) {
      this.dataSeries.series.push({ name: this.name, samples: new List(), data: new List<DataSeriesPoint>(), selected: true, shape: { color: RGBColors[this.dataSeries.series.length], shape: '' } });
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  private addDataToThisSeries(activeDataSeries: DataSeries): void {
    let ids = this.dataGrid.getSelectedIds();
    if (!!ids) {
      for (let id of ids) {
        activeDataSeries?.samples.only1Push(id);
      }
      if (!activeDataSeries.data) {
        activeDataSeries.data = new List<DataSeriesPoint>();
      }
      let points = this.getFloatDataFromGrid(activeDataSeries);
      for (let p of points) {
        activeDataSeries.data.only1Push(p);
      }
    }
    console.log(this.dataSeries);
  }

  public addDataToSeries(): void {
    if (!!this.dataSeries) {
      for (let ds of this.dataSeries.series) {
        if (ds.selected) {
          this.addDataToThisSeries(ds);
          break;
        }
      }
    }
  }

  public plot(): void {
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    console.log(this.dataSeries);
    let modalRef = this.modalService.open(PlottingComponent, { fullscreen: true });
    modalRef.componentInstance.params = { ref: modalRef };
  }

  private setAxisNames(): void {
    let xAxisText = '';
    let yAxisText = '';
    switch (this.xOperator) {
      case '0':
      default:
        xAxisText = this.xSelected;
        break;
      case '1':
        xAxisText = '1 / ' + this.xSelected
        break;
      case '2':
        xAxisText = this.xSelected + ' / ' + this.xSelected2;
        break;
    }

    if (this.xLog) {
      xAxisText = 'Log ( ' + xAxisText + ' )';
    }

    switch (this.yOperator) {
      case '0':
      default:
        yAxisText = this.ySelected;
        break;
      case '1':
        yAxisText = '1 / ' + this.ySelected
        break;
      case '2':
        yAxisText = this.ySelected + ' / ' + this.ySelected2;
        break;
    }

    if (this.yLog) {
      yAxisText = 'Log ( ' + yAxisText + ' )';
    }

    this.dataSeries.xAxis = xAxisText;
    this.dataSeries.yAxis = yAxisText;
  }

  public newSeries() {
    this.xyEdit = true;
    this.setAxisNames();
    if (this.dataSeries.series.length === 0) {
      this.dataSeries.series = [];
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  public reset(): void {
    let ref = this.modalService.open(ConfirmComponent, { centered: true });
    ref.componentInstance.params = {
      headerText: 'Confirm',
      bodyText: 'This operation will reset all stored information for the data plotting. Please, confirm'
    };
    let sub2 = ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        sub2.unsubscribe();
        if (response === CONFIRM) {
          this.resetSeries();
        }
      }
    );
  }

  public resetSeries() {
    this.xLog = false;
    this.yLog = false;
    this.xSelected = '';
    this.ySelected = '';
    this.xRange = { min: -10000, max: 10000 };
    this.yRange = { min: -10000, max: 10000 };
    this.xOperator = '0';
    this.yOperator = '0';
    this.dataSeries = { xAxis: '', yAxis: '', width: this.chartWidth, height: this.chartWidth, series: [] };
    this.storeService.clean(DATA_SERIES);
    if (!!this.dataGrid) {
      this.dataGrid.reset();
    }
    this.xyEdit = true;
  }

  public select(ds: DataSeries) {
    if (!!ds.selected) {
      this.selectedDataSeries = undefined;
      ds.selected = false;
      this.pointButtonEnabled = false;
    } else {
      for (let d of this.dataSeries.series) {
        d.selected = false;
      }
      this.selectedDataSeries = ds;
      ds.selected = true;
      this.pointButtonEnabled = true;
    }
  }

  public set() {
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
  }

  public close() {
    this.emitter.emit(CANCEL);
  }

  private getDataByIds(): void {
    if (this.dataSeries && this.dataSeries.series.length > 0) {
      for (let s of this.dataSeries.series) {
        let sampleList = s.samples;
        if (!!sampleList && sampleList.length > 0) {
          let r = this.sampleService.getSamplesById(sampleList).subscribe(
            (res: any) => {
              console.log(res);
              r.unsubscribe();
            }
          );
        }

      }
    }
  }

}
