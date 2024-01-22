import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataSeries, DATA_SERIES } from 'src/app/models/series';
import { StoreService } from 'src/app/services/common/store.service';
import { ModalParams, CANCEL, CONFIRM } from '../modal-params';


@Component({
  selector: 'app-data-plotting-series',
  templateUrl: './data-plotting-series.component.html',
  styleUrls: ['./data-plotting-series.component.scss']
})
export class DataPlottingSeriesComponent implements OnInit {
  public name = '';
  public dataSeries = new Array<DataSeries>();
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
      this.dataSeries = [...ds];
      console.log(ds);
    }
    if (!!this.params && !!this.params.list) {
      for (let item of this.params.list) {
        this.xAxis.push(item.value);
        this.yAxis.push(item.value);
      }
    }
  }

  public addSeries() {
    this.dataSeries.push({ name: this.name, xAxis: this.xSelected, yAxis: this.ySelected, data: [], selected: false });
    this.name = '';
    this.xSelected = '';
    this.ySelected = '';
  }

  public select(ds: DataSeries) {
    if (!!ds.selected) {
      this.selectedDataSeries = undefined;
      ds.selected = false;
    } else {
      for (let d of this.dataSeries) {
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
