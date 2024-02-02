import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { Series, DataSeries, DATA_SERIES, DataSeriesPoint } from 'src/app/models/series';

@Component({
  selector: 'app-plotting',
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  public series: Series = { xAxis: '', yAxis: '', series: [] };
  public chartOptions: any;
  public charts: any;

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.series = this.storeService.get(DATA_SERIES);
  }

  getChartInstance(chart: object) {
    this.charts = chart;
    console.log(this.charts);
  }

  private drawChart(): void {
    if (!this.series) {
      return;
    }
    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Data plot"
      },
      axisX: {
        title: '' + this.series.xAxis,
      },
      axisY: {
        title: '' + this.series.yAxis,
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: function (e: any) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      },
      data: []
    }
  }

}
