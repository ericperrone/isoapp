import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Series, DataSeries, DATA_SERIES, ChartShapes } from 'src/app/models/series';
import { StoreService } from 'src/app/services/common/store.service';
import { ModalParams, CANCEL, CONFIRM } from '../modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlottingComponent } from 'src/app/geo-modelling/plotting/plotting.component';

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

  constructor(private storeService: StoreService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    let ds = this.storeService.get(DATA_SERIES);
    if (!!ds) {
      this.dataSeries = ds;
      this.xSelected = this.dataSeries.xAxis;
      this.ySelected = this.dataSeries.yAxis;
      console.log(ds);
    }
    if (!!this.params && !!this.params.list) {
      console.log(this.params);
      for (let item of this.params.list) {
        this.xAxis.push(item.value);
        this.yAxis.push(item.value);
      }
    }
  }

  public xOperatorChange(): void {
    if (this.xOperator === '1' || this.xOperator === '0') {
      this.xSelectedChange();
    }
  }

  public yOperatorChange(): void {
    if (this.yOperator === '1' || this.yOperator === '0') {
      this.ySelectedChange();
    }
  }

  public xLogHandler(): void {
    if (!!this.xLog) {
      this.xRangeBak = {...this.xRange};
      if (this.xRange.min != 0) {
        this.xRange.min = Math.log10(this.xRange.min);
      }
      if (this.xRange.max != 0) {
        this.xRange.max = Math.log10(this.xRange.max);
      }
    } else {
      this.xRange = {...this.xRangeBak};
    }
    this.setAxisNames();
  }

  public yLogHandler(): void {
    if (!!this.yLog) {
      this.yRangeBak = {...this.yRange};
      if (this.yRange.min != 0) {
        this.yRange.min = Math.log10(this.yRange.min);
      }
      if (this.yRange.max != 0) {
        this.yRange.max = Math.log10(this.yRange.max);
      }
    } else {
      this.yRange = {...this.yRangeBak};
    }
  }

  public xSelectedChange(): void {
    this.xData = this.computeRange(this.xSelected, this.xOperator, this.xRange, (this.xOperator === '2' && this.xSelected2) ? this.xSelected2 : undefined);
  }

  public ySelectedChange(): void {
    this.yData = this.computeRange(this.ySelected, this.yOperator, this.yRange, (this.yOperator === '2' && this.ySelected2) ? this.ySelected2 : undefined);
  }

  public xSelected2Change(): void {
    this.xData = this.computeRange(this.xSelected, this.xOperator, this.xRange, (this.xOperator === '2' && this.xSelected2) ? this.xSelected2 : undefined);
  }

  public ySelected2Change(): void {
    this.yData = this.computeRange(this.ySelected, this.yOperator, this.yRange, (this.yOperator === '2' && this.ySelected2) ? this.ySelected2 : undefined);
  }

  private computeRange(selected1: string, operator: string, range: Range, selected2?: string): number[] {
    switch (operator) {
      case '0':
      default:
        return this.computeNormalRange(selected1, range);
      case '1':
        return this.computeInverseRange(selected1, range);
      case '2':
        return this.computeRatioRange(selected1, range, selected2);
    }
  }

  private sort(x: number[]): number[] {
    let ordered = [...x];
    return ordered.sort((x, y) => x - y);
  }

  private computeNormalRange(selected: string, range: Range): number[] {
    let values: number[] = this.getFloatValues(selected, false);
    let ordered = this.sort(values);
    range.min = ordered[0];
    range.max = ordered[ordered.length - 1];
    return values;
  }

  private computeInverseRange(selected: string, range: Range): number[] {
    let values: number[] = this.getFloatValues(selected, true);
    let ordered = this.sort(values);
    range.min = ordered[0];
    range.max = ordered[ordered.length - 1];
    return values;
  }

  private computeRatioRange(selected1: string, range: Range, selected2?: string): number[] {
    let values = new Array<number>();
    if (!!selected2) {
      let valuesN: number[] = this.getFloatValues(selected1, false);
      let valuesD: number[] = this.getFloatValues(selected2, false);
      for (let i = 0; i < valuesN.length; i++) {
        if (valuesD[i] !== 0)
          values.push(valuesN[i] / valuesD[i]);
      }
      let ordered = this.sort(values);
      range.min = ordered[0];
      range.max = ordered[ordered.length - 1];
    }
    return values;
  }

  private getColumn(name: string): string[] {
    let column = new Array<string>();
    if (!!this.params && !!this.params.anyParams) {
      let hx = -1;
      for (let h of this.params.anyParams.headers) {
        if (h.content === name) {
          hx = h.col;
          break;
        }
      }

      if (hx > 0) {
        for (let x of this.params.anyParams.selection) {
          // if (x[hx].content.length > 0)
          column.push(x[hx].content);
        }
      }

    }
    return column;
  }

  private getFloatValues(headerName: string, inverse: boolean): number[] {
    let data: string[] = this.getColumn(headerName);
    let values = new Array<number>();
    for (let d of data) {
      if (d.length === 0) {
        values.push(0);
      } else {
        if (!inverse)
          values.push(parseFloat(d));
        else {
          let x = parseFloat(d);
          values.push(1 / x);
        }
      }
    }
    return values;
  }

  public addDataSeries(): void {
    if (!!this.dataSeries) {
      this.dataSeries.series.push({ name: this.name, samples: [], data: [], selected: false, shape: { color: RGBColors[this.dataSeries.series.length], shape: '' } });
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  public addDataToSeries(): void {
    let activeDataSeries;
    if (!!this.dataSeries) {
      for (let ds of this.dataSeries.series) {
        if (ds.selected) {
          activeDataSeries = ds;
          break;
        }
      }

      if (this.xData.length <= 0) {
        this.xData = this.computeRange(this.xSelected, this.xOperator, { min: 0, max: 0 }, this.xSelected2.length > 0 ? this.xSelected2 : undefined);
        this.yData = this.computeRange(this.ySelected, this.yOperator, { min: 0, max: 0 }, this.ySelected2.length > 0 ? this.ySelected2 : undefined);
      }

      if (this.xLog) {
        for (let i = 0; i < this.xData.length; i++) {
          this.xData[i] = this.xData[i] > 0 ? this.xData[i] = Math.log10(this.xData[i]) : this.xData[i];
        }
      }

      if (this.yLog) {
        for (let i = 0; i < this.yData.length; i++) {
          this.yData[i] > 0 ? this.yData[i] = Math.log10(this.yData[i]) : this.yData[i];
        }
      }

      for (let i = 0; i < this.xData.length; i++) {
        if (this.xData[i] === 0 || this.yData[i] === 0) {
          continue;
        }
        if ((this.xRange.min <= this.xData[i] && this.xData[i] <= this.xRange.max) &&
          (this.yRange.min <= this.yData[i] && this.yData[i] <= this.yRange.max))
          activeDataSeries?.data.push({ x: this.xData[i], y: this.yData[i] });
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
    this.setAxisNames();
    this.dataSeries.series = [];
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
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
}
