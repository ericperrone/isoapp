import { Component, Input, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { SpiderData, SpiderDiagram, SpiderSeries } from 'src/app/models/series';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { SpiderNormalizationComponent } from 'src/app/shared/modals/spider-normalization/spider-normalization.component';
import { getElementName, locateByValue, saveCsvFile, toPPM } from 'src/app/shared/tools';

export const REE = ['La', 'Ce', 'Pr', 'Nd', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Yb', 'Lu'];

export interface SpiderNorm {
  method: string;
  keys: Array<string>;
  norm: any;
  order?: Array<string>;
}

@Component({
  selector: 'app-spider',
  templateUrl: './spider.component.html',
  styleUrls: ['./spider.component.scss']
})
export class SpiderComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: any;
  public onlyREE = false;
  public showChart = false;
  public norms: Array<SpiderNorm> = new Array<SpiderNorm>();
  public charts: any;
  public chartOptions: any;
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);;
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
  public fixedRatio = false;
  @Input('params') params: GeoModel | undefined;
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    console.log(event);
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    this.chartSizeChange();
  }

  constructor(private modalService: NgbModal, private geoModelsService: GeoModelsService,
    private eventGeneratorService: EventGeneratorService) { }

ngOnDestroy(): void {
  if (this.sub) {
    this.sub.unsubscribe();
  }
}

  ngOnInit(): void {
    this.sub = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => {
        console.log(this.ref);
        if (this.ref) {
          this.ref.close();
        }
      }
    );

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
          if (!!r.ord) {
            sn.order = JSON.parse(r.ord);
          }
          for (let k of keys) {
            Object.defineProperty(sn.norm, k, { value: parseFloat(obj[k]) });
          }
          this.norms.push(sn);
        }
        if (this.norms.length > 0)
          this.selectedMethod = this.norms[0].method;
        s.unsubscribe();
        this.chartSizeChange();
        // console.log(this.norms);
      }
    );
  }

  ngAfterViewInit(): void {
  }

  public handleREE(): void {
    this.chartSizeChange();
  }

  private setNorm(): void {
    if (this.norms.length < 1)
      return;
    for (let n of this.norms) {
      if (n.method === this.selectedMethod) {
        this.theNorm = { ...n };
        // console.log(this.theNorm);
        return;
      }
    }
  }

  public getChartInstance(chart: object) {
    this.charts = chart;
  }

  public addNorm(): void {
    let refer = this.modalService.open(SpiderNormalizationComponent, { centered: true, backdrop: false, size: 'lg' });
    refer.componentInstance.emitter.subscribe((result: string) => {
      console.log(result);
      if (result === CONFIRM) {
      }
      refer.close()
    });
  }

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
            // console.log(item);
            let name = getElementName(item.name);
            if (!!this.theNorm && !!this.theNorm.norm[name] && item.value.length > 0) {
              if (!!this.onlyREE) {
                if (locateByValue(REE, name) > -1) {
                  ss.data.push({ label: name, y: toPPM(item) / this.theNorm.norm[name] });
                }
              } else {
                ss.data.push({ label: name, y: toPPM(item) / this.theNorm.norm[name] });
              }
            }
          }
        }
        ss.data = ss.data.sort((a: SpiderData, b: SpiderData) => {
          let order = this.theNorm.order;
          if (!!order) {
            let posA = locateByValue(order, a.label);
            let posB = locateByValue(order, b.label);
            return posA - posB;
          }
          return 0
        });
        this.spiderDiagram.series.push(ss);
      }
    }
  }

  public chartSizeChange() {
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

  public donwloadCsv(): void {
    let line = '';
    if (!!this.spiderDiagram && !!this.spiderDiagram.series) {
      line += 'Normalization: ' + this.selectedMethod + '\n';
      for (let s of this.spiderDiagram.series) {
        line += 'Sample name: ' + s.sample + '\n';
        for (let d of s.data) {
          line += d.label + ';' + d.y + "\n";
        }
      }
    }
    saveCsvFile(line);
  }

  private drawChart(): void {
    this.setSeries();
    // console.log(this.spiderDiagram);
    let data = new Array<any>();
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
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        interval: 1
      },
      axisY: {
        title: 'Sample concentration / ' + this.selectedMethod,
        titleFontSize: this.fontSize,
        labelFontSize: this.fontSize,
        margin: 10,
        logarithmic: true
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
  }

}
