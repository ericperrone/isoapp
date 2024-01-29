import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Series, DataSeries, DATA_SERIES, DataSeriesSet } from 'src/app/models/series';
import { StoreService } from 'src/app/services/common/store.service';
import { ModalParams, CANCEL, CONFIRM } from '../modal-params';

export const RGBColors = [
  '#00ffff', '#000000', '#0000ff', '#ff00ff', '#808080', '#008000', '#00ff00', '#800000', '#000080', '#808000', '#800080', '#ff0000', '#008080', '#ffff00', '#ffa500'
];

@Component({
  selector: 'app-data-plotting-series',
  templateUrl: './data-plotting-series.component.html',
  styleUrls: ['./data-plotting-series.component.scss']
})
export class DataPlottingSeriesComponent implements OnInit {
  public color = '';
  public name = '';
  public dataSeries: Series = { xAxis: '', yAxis: '', series: [] };
  public xAxis = new Array<string>();
  public yAxis = new Array<string>();
  public xData = new Array<number>();
  public yData = new Array<number>();
  public xSelected = '';
  public ySelected = '';
  public selectedDataSeries: DataSeries | undefined;
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    let ds = this.storeService.get(DATA_SERIES);
    if (!!ds) {
      this.dataSeries = ds;
      this.xSelected = this.dataSeries.xAxis;
      this.ySelected = this.dataSeries.yAxis;
      console.log(ds);
    }
    if (!!this.params && !!this.params.list) {
      for (let item of this.params.list) {
        this.xAxis.push(item.value);
        this.yAxis.push(item.value);
      }
    }
  }

  public addDataSeries(): void {
    if (!!this.dataSeries) {
      this.dataSeries.series.push({ name: this.name, data: [], selected: false, shape: { color: RGBColors[this.dataSeries.series.length], shape: '' } });
      this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    }
  }

  public addDataToSeries(activeDataSeries: DataSeries): void {
    if (!!this.params && !!this.params.anyParams) {
      let hx = -1;
      let hy = -1
      for (let h of this.params.anyParams.headers) {
        if (h.content === this.dataSeries.xAxis) {
          hx = h.col;
        } else if (h.content === this.dataSeries.yAxis) {
          hy = h.col;
        }
      }

      for (let s of this.params.anyParams.selection) {
        console.log(s);
        let d: DataSeriesSet = { x: new Array<number>, y: new Array<number> };
        let x = '';
        let y = '';
        for (let i = 0; i < s.length; i++) {
          if (s[i].col === hx && s[i].content.length > 0) {
            x = s[i].content.length;
          }
          if (s[i].col === hy && s[i].content.length > 0) {
            y = s[i].content.length;
          }
        }
        if (x.length > 0 && y.length > 0) {
          d.x.push(parseFloat(x));
          d.y.push(parseFloat(y));
        }
        activeDataSeries?.data.push(d);
      }

      console.log(this.dataSeries);
    }
  }

  public newSeries() {
    this.dataSeries.xAxis = this.xSelected;
    this.dataSeries.yAxis = this.ySelected;
    this.dataSeries.series = [];
    // this.dataSeries.series.push({ name: this.name, data: [], selected: false, shape: { color: this.color, shape: '' } });
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
  }

  public resetSeries() {
    this.xSelected = '';
    this.ySelected = '';
    this.dataSeries = { xAxis: '', yAxis: '', series: [] };
    this.storeService.clean(DATA_SERIES);
  }

  // public addSeries() {
  //   this.dataSeries.xAxis = this.xSelected;
  //   this.dataSeries.yAxis = this.ySelected;
  //   this.dataSeries.series.push({ name: this.name, data: [], selected: false,  });
  //   this.name = '';
  //   this.xSelected = '';
  //   this.ySelected = '';
  // }

  public select(ds: DataSeries) {
    if (!!ds.selected) {
      this.selectedDataSeries = undefined;
      ds.selected = false;
    } else {
      for (let d of this.dataSeries.series) {
        d.selected = false;
      }
      this.selectedDataSeries = ds;
      ds.selected = true;
    }
  }

  public set() {
    this.storeService.push({ key: DATA_SERIES, data: this.dataSeries });
    this.emitter.emit(this.selectedDataSeries);
  }

  public close() {
    this.emitter.emit(CANCEL);
  }
}
