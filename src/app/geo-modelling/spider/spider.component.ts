import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { SpiderData, SpiderDiagram, SpiderSeries } from 'src/app/models/series';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { getElementName } from 'src/app/shared/tools';

export interface SpiderNorm {
  method: string;
  keys: Array<string>;
  norm: any;
}

@Component({
  selector: 'app-spider',
  templateUrl: './spider.component.html',
  styleUrls: ['./spider.component.scss']
})
export class SpiderComponent implements OnInit, AfterViewInit {
  public showChart = false;
  public norms: Array<SpiderNorm> = new Array<SpiderNorm>();
  public charts: any;
  public chartOptions: any;
  public chartWidth: number = 1400;
  public chartHeight: number = 800;
  public fontSize = 16;
  public legendFontSize = 20;
  public changeSize = false;
  public ref: any;
  public selectedMethod = "";
  public theNorm: any;
  public spiderDiagram: SpiderDiagram = {
    width: this.chartWidth,
    height: this.chartHeight,
    series: new Array<SpiderSeries>()
  }
  @Input('params') params: GeoModel | undefined;

  constructor(private geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    console.log(this.params);
    if (this.params?.modalRef) {
      this.ref = this.params.modalRef;
    }

    let s = this.geoModelsService.getNorms().subscribe(
      (res: any) => {
        for (let r of res) {
          let sn: SpiderNorm = { method: r.method, keys: [], norm: {} };
          let obj = JSON.parse(r.norm);
          let keys = Object.keys(obj);
          sn.keys = keys;
          for (let k of keys) {
            Object.defineProperty(sn.norm, k, { value: parseFloat(obj[k]) });
          }
          this.norms.push(sn);
        }
        if (this.norms.length > 0)
          this.selectedMethod = this.norms[0].method;
        s.unsubscribe();
        // this.drawChart();
      }
    );
  }

  ngAfterViewInit(): void {
    this.chartSizeChange();
  }

  private setNorm(): void {
    if (this.norms.length < 1)
      return;
    for (let n of this.norms) {
      if (n.method === this.selectedMethod) {
        this.theNorm = { ...n };
        console.log(this.theNorm);
        return;
      }
    }
  }

  public getChartInstance(chart: object) {
    this.charts = chart;
    // console.log(this.charts);
  }

  //{type: 'C', name: 'TiO2 (WT%)', value: '0.44'}
  public setSeries(): void {
    this.setNorm();
    if (!!this.params && !!this.params.endMembers && !!this.theNorm) {
      console.log(this.theNorm);
      this.spiderDiagram.series.length = 0;
      for (let em of this.params?.endMembers) {
        let ss: SpiderSeries = { sample: '', data: new Array<SpiderData>() };
        for (let item of em) {
          if (item.name.toLowerCase().indexOf('sample') >= 0) {
            ss.sample = item.value;
            continue;
          }
          if (item.type === 'C' || item.type === 'I') {
            let name = getElementName(item.name);
            if (!!this.theNorm && !!this.theNorm.norm[name] && item.value.length > 0) {
              ss.data.push({ label: name, y: parseFloat(item.value) / this.theNorm.norm[name] });
            }
          }
        }
        this.spiderDiagram.series.push(ss);
      }
    }
  }

  public chartSizeChange() {
    this.showChart = false;
    setTimeout(() => {
      this.drawChart();
      this.showChart = true;
    }, 50);
  }

  private drawChart(): void {
    this.setSeries();
    console.log(this.spiderDiagram);
    let data = [] // <-- qui inserire la struttura 
    for (let s of this.spiderDiagram.series) {
      data.push({ type: 'line', showInLegend: true, name: s.sample, dataPoints: s.data });
    }

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      exportEnabled: true,
      zoomEnabled: true,
      width: this.chartWidth,
      height: this.chartHeight,
      axisX: {
        // title: '' + this.series.xAxis,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize
      },
      axisY: {
        // title: '' + this.series.yAxis,
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
      data: data
    }

    console.log(this.chartOptions);
  }

}
