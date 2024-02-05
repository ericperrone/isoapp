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
    this.drawChart();
  }

  getChartInstance(chart: object) {
    this.charts = chart;
    console.log(this.charts);
  }

  private createChart(): void {

  }

  private drawChart(): void {
    if (!this.series) {
      return;
    }

    let series = [];
    for (let s of this.series.series) {
      series.push({
        type: 'scatter',
        name: s.name,
        showInLegend: true,
        color: '' + s.shape.color,
        dataPoints: s.data,
        markerType: s.shape.shape ? '' + s.shape.shape : 'circle'
      });
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
      options: {
        elements: {
          point: {
            
            pointStyle: 'star',
            radius: 10
          }
        }
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
      data: series
    }
  }

}
