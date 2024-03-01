import { Component, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { Series, DataSeries, DATA_SERIES, DataSeriesPoint } from 'src/app/models/series';


@Component({
  selector: 'app-plotting',
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.scss']
})
export class PlottingComponent implements OnInit {
  @Input() params: any;
  public series: Series = { xAxis: '', yAxis: '', width: 500, height: 400, series: [] };
  public chartOptions: any;
  public charts: any;
  public fontSize = 16;
  public legendFontSize = 20;
  public ref: any;
  public chartWidth: number = 0;
  public chartHeight: number = 0;
  public changeSize = false;
  public draw = true;

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    if (!!this.params) {
      this.ref = this.params.ref;
    }
    this.series = this.storeService.get(DATA_SERIES);
    this.chartWidth = this.series.width;
    this.chartHeight = this.series.height;
    this.drawChart();
  }

  public getChartInstance(chart: object) {
    this.charts = chart;
    // console.log(this.charts);
  }

  public chartSizeChange() {
    this.changeSize = false;
    // this.chartOptions = {};
    this.draw = false;
    this.drawChart();
    setTimeout(() => {
      this.draw = true;
      this.drawChart();
    }, 50);
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
      exportEnabled: true,
      zoomEnabled: true,
      width: this.chartWidth,
      height: this.chartHeight,
      axisX: {
        title: '' + this.series.xAxis,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize
      },
      axisY: {
        title: '' + this.series.yAxis,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        fontSize: this.legendFontSize,
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

    console.log(this.chartOptions);
  }

}
