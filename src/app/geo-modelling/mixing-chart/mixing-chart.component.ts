import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MIX_STORE, MixStored } from '../end-members-modal/end-members-modal.component';
import { StoreService } from 'src/app/services/common/store.service';

interface chartData {
  title: string;
  points: Array<number>;
}

interface ShowedRow {
  row: Array<string>;
}

interface DP {
  x: number;
  y: number;
}

interface ScaleAxis {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

const size = 500;

@Component({
  selector: 'app-mixing-chart',
  templateUrl: './mixing-chart.component.html',
  styleUrls: ['./mixing-chart.component.scss']
})
export class MixingChartComponent implements OnInit {
  @ViewChild('canvasid') canvasId: ElementRef | undefined;
  public charts: any;
  public chartWidth: number = size; // Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = (size * 3) / 4// Math.floor(window.innerHeight * 0.8);
  public fontSize = 16;
  public legendFontSize = 20;
  public changeSize = false;
  public fixedRatio = false;
  public chartOptions: any;
  public mixData: MixStored | undefined;

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {    
    // if (!!this.canvasId) {
    //   let e = this.canvasId.nativeElement;
    //   this.chartWidth = 200;
    //   this.chartHeight = (this.chartWidth * 3) / 4;
    // }
    this.chartOptions = {};
    setTimeout(() => {
      this.chart();
    }, 80);
    
  }

  getChartInstance(chart: object) {
    this.charts = chart;
  }

  private getCachedData(): void {
    this.mixData = this.storeService.get(MIX_STORE);
  }

  public chartSizeChange() {
    this.changeSize = false;
    setTimeout(() => {
      if (this.fixedRatio) {
        this.chartWidth = 4 * this.chartHeight / 3;
      }
      this.chart();
    }, 50);
  }

  private getBorder3(data: any): any {
    let dataPoint1 = new Array<any>();
    let dataPoint2 = new Array<any>();
    let dataPoint3 = new Array<any>();

    for (let i = 1; i < data[0].row.length; i++) {
      if (parseFloat(data[0].row[i]) === 0) {
        dataPoint1.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
      if (parseFloat(data[1].row[i]) === 0) {
        dataPoint2.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
      if (parseFloat(data[2].row[i]) === 0) {
        dataPoint3.push({ x: parseFloat(data[3].row[i]), y: parseFloat(data[7].row[i]) });
      }
    }
    dataPoint1 = dataPoint1.sort((a, b) => { return a.x - b.x });
    dataPoint2 = dataPoint2.sort((a, b) => { return a.x - b.x });
    dataPoint3 = dataPoint3.sort((a, b) => { return a.x - b.x });

    return { dp1: dataPoint1, dp2: dataPoint2, dp3: dataPoint3 };
  }

  private getScaleXY(dp: Array<DP>, epsilonX: number, epsilonY: number): ScaleAxis {
    let scale = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
    let dx = dp.sort((a, b) => { return (b.x - a.x) });
    console.log(dx);
    scale.xMin = dx[0].x - epsilonX;
    scale.xMax = dx[dx.length - 1].x + epsilonX;
    let dy = dp.sort((a, b) => { return (b.y - a.y) });
    console.log(dy);
    scale.yMin = dy[0].y - epsilonY;
    scale.yMax = dy[dy.length - 1].y + epsilonY;
    return scale;
  }


  private getChartsData(data: MixStored): Array<chartData> {
    let charts = new Array<chartData>();
    let title = '';

    let points = new Array();
    for (let i = 0; i < data.mix1.length; i++) {
      points.push(data.mix1[i].mix);
    }

    charts.push({
      title: title,
      points: [...points]
    });

    points = new Array();
    for (let i = 0; i < data.mix2.length; i++) {
      points.push(data.mix2[i].mix);
    }
    
    charts.push({
      title: title,
      points: [...points]
    });
    return charts;
  }

  public chart(): void {
    // this.chartView = true;

    this.getCachedData();
    if (!!this.mixData) {
      let data = this.mixData;
      // let geoData = stored.geoData;
      // console.log(geoData);

      let xText = data.mix1[0].samples[0].element;
      let yText = data.mix2[0].samples[0].element;

      let cardinality = data.mix1[0].samples.length;

      // let cardinality = this.getCardinality(data);
      // if (cardinality !== 2 && cardinality !== 3)
      //   return;

      let chartsData = this.getChartsData(data);
      // if (chartsData.length < 2) {
      //   this.chartView = false;
      //   return;
      // }

      let charts = new Array();

      for (let i = 0; i < chartsData.length; i += 2) {
        if (i + 1 < chartsData.length) {
          let dp = new Array<any>();
          for (let k = 0; k < chartsData[i].points.length; k++) {
            dp.push({ x: chartsData[i].points[k], y: chartsData[i + 1].points[k] });
          }
          charts.push({
            type: cardinality === 3 ? 'scatter' : 'line',
            showInLegend: false,
            dataPoints: dp
          });
        }
      }


      let dpem = new Array<any>();

      if (cardinality === 3) {
        // if (!this.checkIsotopes(geoData)) {
        //   for (let i = 0; i < geoData.length - 1; i++) {
        //     for (let j = 0; j < geoData[i].members.length; j++) {
        //       dpem.push({ x: geoData[i].members[j].concentration, y: geoData[i + 1].members[j].concentration });
        //     }
        //   }

        //   for (let j = 0; j < geoData[0].members.length; j++) {
        //     dpem.push({ x: geoData[0].members[j].concentration, y: geoData[geoData.length - 1].members[j].concentration });
        //   }

        //   charts.push({
        //     type: 'line',
        //     // lineColor: 'blue',
        //     // markerColor: 'blue',
        //     dataPoints: dpem
        //   });
        // } else {
        let additional = this.getBorder3(data);
        charts.push({
          type: 'line',
          markerColor: 'blue',
          lineColor: 'blue',
          dataPoints: additional.dp1
        });
        charts.push({
          type: 'line',
          markerColor: 'blue',
          lineColor: 'blue',
          dataPoints: additional.dp2
        });
        charts.push({
          type: 'line',
          markerColor: 'blue',
          lineColor: 'blue',
          dataPoints: additional.dp3
        });
        // }
      }

      let scale = this.getScaleXY(charts[0].dataPoints, 0.5, 0.5);
      console.log(scale);

      this.chartOptions = {
        animationEnabled: true,
        theme: "light2",
        exportEnabled: true,
        zoomEnabled: true,
        width: this.chartWidth,
        height: this.chartHeight,
        axisX: {
          title: '' + xText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize,
        },
        axisY: {
          title: '' + yText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize,
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
        data: charts
      }

    }
    console.log(this.chartOptions);
  }


}
