import { Component, Input, OnInit, HostListener } from '@angular/core';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { distinct } from 'src/app/shared/tools';

export interface Point2 {
  member?: string;
  x: number;
  y: number;
}

export interface Point3 {
  member?: string;
  a: number;
  b: number;
  c: number;
}

export const SQRT3 = 1.7320508;

@Component({
  selector: 'app-ternary',
  templateUrl: './ternary.component.html',
  styleUrls: ['./ternary.component.scss']
})
export class TernaryComponent implements OnInit {
  @Input('params') params: GeoModel | undefined;
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    // console.log(event);
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    // this.chartSizeChange();
  }
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);;
  public changeSize = false;
  public ref: any;
  public elementList = new Array<string>();
  public vertices = ['', '', ''];
  private verticesPoints = new Array<any>;
  public chartOptions: any;
  public lato: number = 75;
  public fontSize = 16;
  public showChart = false;
  public charts: any;
  public xyPoints = new Array<Point2>();
  public abcPoints = new Array<Point3>();

  constructor() { }

  ngOnInit(): void {
    console.log(this.params);
    this.ref = this.params?.modalRef;
    this.buildElementsList();
  }

  public donwloadCsv(): void {

  }

  public chartSizeChange(): void {

  }

  public getChartInstance(chart: object) {
    this.charts = chart;
  }

  public checkElements(): void {
    if (this.vertices[0].trim().length === 0 || this.vertices[1].trim().length === 0 || this.vertices[2].trim().length === 0)
      return;
    if (this.vertices[0] != this.vertices[1] && this.vertices[0] != this.vertices[2] &&
      this.vertices[1] != this.vertices[2]) {
      this.drawChart();
    }
  }

  private buildElementsList(): void {
    if (!!this.params && !!this.params.endMembers) {
      for (let e of this.params?.endMembers) {
        for (let item of e) {
          if (item.type != 'F') {
            this.elementList.push(item.name);
          }
        }
      }
      this.elementList = distinct(this.elementList);
      console.log(this.elementList);
    }
  }

  private setVerticesPoints(): void {
    this.verticesPoints.length = 0;
    let zero = 0.0001;
    this.verticesPoints.push({ x: zero, y: zero });
    this.verticesPoints.push({ x: this.lato, y: zero });
    this.verticesPoints.push({ x: this.lato * 0.5, y: this.lato * 0.5 * SQRT3 });
    this.verticesPoints.push({ x: zero, y: zero });
  }

  private buildPoints(): void {
    if (!!this.params && !!this.params.endMembers) {
      for (let e of this.params?.endMembers) {
        let abc = { a: 0, b: 0, c: 0 };
        for (let m of e) {
          if (m.type != 'F') {
            if (m.name == this.vertices[0]) {
              abc.a = parseFloat(m.value);
            } else if (m.name === this.vertices[1]) {
              abc.b = parseFloat(m.value);
            } else if (m.name === this.vertices[2]) {
              abc.c = parseFloat(m.value);
            }
          }
        }
        this.abcPoints.push(abc);
      }
      console.log(this.abcPoints);
      this.toPoint2();
    }
  }

  private toPoint2(): void {
    this.xyPoints.length = 0;
    for (let e of this.abcPoints) {
      let sum = e.a + e.b + e.c;
      let aa = (e.a / sum) * 100;
      let bb = (e.b / sum) * 100;
      let cc = (e.c / sum) * 100;
      // let correction = 1 / this.lato;
      // this.xyPoints.push({ x: 1 - aa - bb * 0.5, y: SQRT3 * 0.5 * bb });
      console.log(aa + ', ' + bb + ', ' + cc);
      this.xyPoints.push({ x: this.lato - aa - bb * 0.5, y: SQRT3 * 0.5 * bb });
    }
    console.log(this.xyPoints);
  }

  private drawChart(): void {
    this.showChart = true;
    let data = new Array<any>();
    this.setVerticesPoints();
    this.buildPoints();
    data.push({ type: 'line', showInLegend: false, name: '', dataPoints: this.verticesPoints });
    data.push({ type: 'scatter', showInLegend: false, name: '', dataPoints: this.xyPoints });

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: true,
      zoomEnabled: true,
      width: this.chartWidth,
      height: this.chartHeight,
      axisX: {
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        // interval: 1
      },
      axisY: {
        // title: 'Sample concentration / ' + this.selectedMethod,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        margin: 10,
        // interval: 10,
        // minimum: 0,
        // maximum: 10000
        // logarithmic: true
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        fontSize: this.fontSize,
        itemclick: function (e: any) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      },
      data: data
    }
  }

}
