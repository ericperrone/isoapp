import { Component, Input, OnInit, HostListener } from '@angular/core';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { distinct, saveCsvFile } from 'src/app/shared/tools';

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

export interface CsvLine {
  member: string;
  a?: number;
  b?: number;
  c?: number;
  an?: number;
  bn?: number;
  cn?: number;
  x?: number;
  y?: number;
}

export const SQRT3 = 1.7320508;
const zero = 0.0001;

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
    this.chartSizeChange();
  }
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);;
  public changeSize = false;
  public ref: any;
  public elementList = new Array<string>();
  public vertices = ['', '', ''];
  public vertices2 = ['', '', ''];
  public labels = ['', '', ''];
  public operators = [0, 0, 0];
  private verticesPoints = new Array<any>();
  private grid1Points = new Array<Array<any>>();
  private grid2Points = new Array<Array<any>>();
  public chartOptions: any;
  public lato: number = 1;
  public fontSize = 16;
  public showChart = false;
  public charts: any;
  public xyPoints = new Array<Point2>();
  public abcPoints = new Array<Point3>();
  public fixedRatio = false;

  constructor() { }

  ngOnInit(): void {
    console.log(this.params);
    this.ref = this.params?.modalRef;
    this.buildElementsList();
  }

  public donwloadCsv(): void {
    let csv = '';
    csv += 'sample;'
      + this.labels[0] + ';' + this.labels[1] + ';' + this.labels[2] + ';'
      + this.labels[0] + ' norm.;' + this.labels[1] + ' norm.;' + this.labels[2] + ' norm.;' +
      'x;y\n';


    if (!!this.params && !!this.params.endMembers) {
      for (let e of this.params?.endMembers) {
        let csvLine: CsvLine = { member: '' };
        for (let m of e) {
          if (m.type === 'F' && m.name.toLowerCase().indexOf('sample') > -1) {
            csvLine.member = m.value;
          }
          if (m.type != 'F') {
            if (m.name == this.vertices[0]) {
              csvLine.a = parseFloat(m.value);
            } else if (m.name === this.vertices[1]) {
              csvLine.b = parseFloat(m.value);
            } else if (m.name === this.vertices[2]) {
              csvLine.c = parseFloat(m.value);
            }
          }
        }
        if (!!csvLine.a && !!csvLine.b && !!csvLine.c) {
          let sum = csvLine.a + csvLine.b + csvLine.c;
          csvLine.an = (csvLine.a / sum);
          csvLine.bn = (csvLine.b / sum);
          csvLine.cn = (csvLine.c / sum);
          csvLine.x = this.lato - csvLine.an - csvLine.bn * 0.5;
          csvLine.y = SQRT3 * 0.5 * csvLine.bn;
        }
        csv += csvLine.member + ';'
        csv += (csvLine.a ? csvLine.a : '') + ';';
        csv += (csvLine.b ? csvLine.b : '') + ';';
        csv += (csvLine.c ? csvLine.c : '') + ';';
        csv += (csvLine.an ? csvLine.an : '') + ';';
        csv += (csvLine.bn ? csvLine.bn : '') + ';';
        csv += (csvLine.cn ? csvLine.cn : '') + ';';
        csv += (csvLine.x ? csvLine.x : '') + ';';
        csv += (csvLine.y ? csvLine.y : '') + ';\n';
      }
    }

    saveCsvFile(csv);
  }

  public chartSizeChange() {
    if (this.vertices[0].trim().length === 0 || this.vertices[1].trim().length === 0 || this.vertices[2].trim().length === 0)
      return;
    this.showChart = false;
    setTimeout(() => {
      if (this.fixedRatio) {
        this.chartWidth = 4 * this.chartHeight / 3;
      } else {
        this.chartWidth = Math.floor(window.innerWidth * 0.99);
        this.chartHeight = Math.floor(window.innerHeight * 0.8);
      }
      this.drawChart();
      this.showChart = true;
    }, 50);
  }

  public getChartInstance(chart: object) {
    this.charts = chart;
  }

  public checkElements(): void {
    if (this.vertices[0].trim().length === 0 || this.vertices[1].trim().length === 0 || this.vertices[2].trim().length === 0)
      return;
    if (this.vertices[0] != this.vertices[1] && this.vertices[0] != this.vertices[2] &&
      this.vertices[1] != this.vertices[2]) {
      this.chartSizeChange();
    }
  }

  public checkElements2(n: number): void {
    if (this.vertices2[n] === this.vertices[n]) {
      return;
    }
    if (this.operators[n] === 0)
      this.vertices2[n] = '';
    this.chartSizeChange();
  }

  public checkOperator(n: number): void {
    this.operators[n] = parseInt('' + this.operators[n]);
    if (this.operators[n] === 0)
      this.vertices2[n] = '';
    this.chartSizeChange();
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

  private setLables(): void {
    for (let i = 0; i < this.vertices.length; i++) {
      switch (this.operators[i]) {
        case 0:
          this.labels[i] = this.vertices[i];
          break;
        case 1:
          this.labels[i] = this.vertices[i] + '+' + this.vertices2[i];
          break;
        case 2:
          this.labels[i] = this.vertices[i] + '/' + this.vertices2[i];
          break;
      }
    }
  }

  private setVerticesPoints(): void {
    this.setLables();
    let fontSize = 20;
    let orientation = 'vertical';
    this.verticesPoints.length = 0;    
    this.verticesPoints.push({ indexLabel: this.labels[0], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero, y: zero });
    this.verticesPoints.push({ indexLabel: this.labels[2], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero + this.lato, y: zero });
    this.verticesPoints.push({ indexLabel: this.labels[1], indexLabelFontSize: fontSize, indexLabelOrientation: orientation, indexLabelWrap: true, x: zero + this.lato * 0.5, y: zero + this.lato * 0.5 * SQRT3 });
    this.verticesPoints.push({ x: zero, y: zero });
  }

  private buildPoints(): void {
    if (!!this.params && !!this.params.endMembers) {
      this.abcPoints.length = 0;

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

        for (let m of e) {
          if (m.type != 'F') {
            if (m.name == this.vertices2[0]) {
              if (this.operators[0] == 1)
                abc.a += parseFloat(m.value);
              else if (this.operators[0] == 2 && 0 !== parseFloat(m.value))
                abc.a /= parseFloat(m.value);
            } else if (m.name === this.vertices2[1]) {
              if (this.operators[1] == 1)
                abc.a += parseFloat(m.value);
              else if (this.operators[1] == 2 && 0 !== parseFloat(m.value))
                abc.a /= parseFloat(m.value);
            } else if (m.name === this.vertices2[2]) {
              if (this.operators[2] == 1)
                abc.a += parseFloat(m.value);
              else if (this.operators[2] == 2 && 0 !== parseFloat(m.value))
                abc.a /= parseFloat(m.value);
            }
          }
        }

        this.abcPoints.push(abc);
      }

      this.toPoint2();
    }
  }

  private toPoint2(): void {
    this.xyPoints.length = 0;
    for (let e of this.abcPoints) {
      let sum = e.a + e.b + e.c;
      let aa = (e.a / sum);
      let bb = (e.b / sum);
      let cc = (e.c / sum);
      this.xyPoints.push({ x: zero + (this.lato - aa - bb * 0.5), y: zero + SQRT3 * 0.5 * bb });
    }
  }

  private setGridPoints(): void {
    this.grid1Points = new Array<any>();
    this.grid2Points = new Array<any>();

    this.grid1Points.push([{ x: zero + 0.1, y: zero }, { x: zero + 0.05, y: zero + SQRT3 * 0.5 * 0.1 }]);
    this.grid1Points.push([{ x: zero + 0.2, y: zero }, { x: zero + 0.1, y: zero + SQRT3 * 0.5 * 0.2 }]);
    this.grid1Points.push([{ x: zero + 0.3, y: zero }, { x: zero + 0.15, y: zero + SQRT3 * 0.5 * 0.3 }]);
    this.grid1Points.push([{ x: zero + 0.4, y: zero }, { x: zero + 0.2, y: zero + SQRT3 * 0.5 * 0.4 }]);
    this.grid1Points.push([{ x: zero + 0.5, y: zero }, { x: zero + 0.25, y: zero + SQRT3 * 0.5 * 0.5 }]);
    this.grid1Points.push([{ x: zero + 0.6, y: zero }, { x: zero + 0.3, y: zero + SQRT3 * 0.5 * 0.6 }]);
    this.grid1Points.push([{ x: zero + 0.7, y: zero }, { x: zero + 0.35, y: zero + SQRT3 * 0.5 * 0.7 }]);
    this.grid1Points.push([{ x: zero + 0.8, y: zero }, { x: zero + 0.4, y: zero + SQRT3 * 0.5 * 0.8 }]);
    this.grid1Points.push([{ x: zero + 0.9, y: zero }, { x: zero + 0.45, y: zero + SQRT3 * 0.5 * 0.9 }]);

    this.grid2Points.push([{ x: zero + 0.1, y: zero }, { x: zero + 0.1 + (1 - 0.1) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.1) }]);
    this.grid2Points.push([{ x: zero + 0.2, y: zero }, { x: zero + 0.2 + (1 - 0.2) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.2) }]);
    this.grid2Points.push([{ x: zero + 0.3, y: zero }, { x: zero + 0.3 + (1 - 0.3) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.3) }]);
    this.grid2Points.push([{ x: zero + 0.4, y: zero }, { x: zero + 0.4 + (1 - 0.4) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.4) }]);
    this.grid2Points.push([{ x: zero + 0.5, y: zero }, { x: zero + 0.5 + (1 - 0.5) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.5) }]);
    this.grid2Points.push([{ x: zero + 0.6, y: zero }, { x: zero + 0.6 + (1 - 0.6) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.6) }]);
    this.grid2Points.push([{ x: zero + 0.7, y: zero }, { x: zero + 0.7 + (1 - 0.7) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.7) }]);
    this.grid2Points.push([{ x: zero + 0.8, y: zero }, { x: zero + 0.8 + (1 - 0.8) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.8) }]);
    this.grid2Points.push([{ x: zero + 0.9, y: zero }, { x: zero + 0.9 + (1 - 0.9) * 0.5, y: zero + SQRT3 * 0.5 * (1 - 0.9) }]);
  }
  
  private drawChart(): void {
    this.showChart = true;
    let data = new Array<any>();
    this.setVerticesPoints();
    this.buildPoints();
    this.setGridPoints();
    for (let i = 0; i < 9; i++) {
      data.push({ type: 'line', showInLegent: false, name: '', color: '#cfcfcf', dataPoints: this.grid1Points[i] });  
      data.push({ type: 'line', showInLegent: false, name: '', color: '#cfcfcf', dataPoints: this.grid2Points[i] });  
    }
    data.push({ type: 'line', showInLegend: false, name: '', color: '#000000', dataPoints: this.verticesPoints });
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
        lineColor: '#ffffff',
        labelFontColor: '#ffffff',
        gridColor: '#ffffff',
        minimum: -0.01,
        maximun: 2.1
      },
      axisY: {
        tickColor: '#ffffff',
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        lineColor: '#ffffff',
        labelFontColor: '#ffffff',
        gridColor: '#ffffff',
        minimum: -0.01,
        maximun: 1
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
