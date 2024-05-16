import { Component, OnInit, OnDestroy, Input, ViewChildren, HostListener } from '@angular/core';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION, END_MEMBER, MULTIPLE_SELECTION_MODE, RESET_SELECTION_OUT, END_MEMBER_SET } from '../end-member/end-member.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModelsService, MixingModelPayload } from 'src/app/services/rest/geo-models.service';
import { saveCsvFile } from 'src/app/shared/tools';
import { Subscription } from 'rxjs';
import { getElementByisotope } from 'src/app/shared/const';
import { StoreService } from 'src/app/services/common/store.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlotComponent, PLOT } from 'src/app/shared/modals/plot/plot.component';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';

export const MIXING_CACHE = '_MIXING_CACHE_';

export interface MixingData {
  geoData?: any;
  outResult?: any;
}

interface MemberItem {
  endMemberName: string;
  value: string;
}

interface Computable {
  endMemberName: string;
  elementName: string;
  elementNameCopy?: string;
  elementValue: string;
  elementValueCopy?: string;
  row: number;
  active: boolean;
  concentration: string;
  concentrationValue: string;
}

interface MixingResult {
  mix: number;
  samples: Array<{ member: string; element: string; f: number }>;
}

interface chartData {
  title: string;
  points: Array<number>;
}

interface ShowedRow {
  row: Array<string>;
}

@Component({
  selector: 'app-mixing',
  templateUrl: './mixing.component.html',
  styleUrls: ['./mixing.component.scss']
})
export class MixingComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  handleResize(event: any) {
    console.log(event);
    this.chartWidth = Math.floor(window.innerWidth * 0.99);
    this.chartHeight = Math.floor(window.innerHeight * 0.8);
    this.chartSizeChange();
  }
  @Input('params') params: GeoModel | undefined;
  @ViewChildren('ratio') ratios: any;
  @ViewChildren('inverse') inverses: any;
  public members = new Array<MemberItem>();
  public endMembers: Array<EndMember> | undefined;
  public computables: Array<Computable> | undefined;
  public chartView = false;
  public submitOn = false;
  public ratio = new Array<boolean>();
  public inverse = new Array<boolean>();
  public isCollapsed = true;
  public result: Array<MixingResult> | undefined;
  public currentSelectionItem: any;
  public step: number = 0.05;
  public outResult = new Array<ShowedRow>();
  private tempResult = new Array<ShowedRow>();
  public resultReady = false;
  public addReady = false;
  public chartOptions: any;
  private subReset: Subscription | undefined;
  private subEndMemberSet: Subscription | undefined;
  public geoData = new Array<any>();
  private ref: any;
  public xPoint = 0;
  public yPoint = 0;
  public charts: any;
  public chartWidth: number = Math.floor(window.innerWidth * 0.99);
  public chartHeight: number = Math.floor(window.innerHeight * 0.8);
  public fontSize = 16;
  public legendFontSize = 20;
  public changeSize = false;
  public fixedRatio = false;

  constructor(private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal,
    private storeService: StoreService,
    public geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    // console.log(this.params);
    let stored: MixingData = this.getCachedData();
    console.log(this.params);
    console.log(stored);

    // this.outResult = this.storeService.get(OUT_RESULT);
    this.outResult = stored.outResult;
    if (!this.outResult) {
      this.outResult = new Array<ShowedRow>();
    }
    // this.geoData = this.storeService.get(GEO_DATA);
    this.geoData = stored.geoData;
    if (!this.geoData) {
      this.geoData = new Array<any>();
    }

    this.subReset = this.eventGeneratorService.on(RESET_SELECTION_OUT).subscribe(
      event => {
        if (!!this.computables) {
          for (let i = 0; i < this.computables.length; i++) {
            if (this.computables[i].endMemberName === event.content) {
              this.computables[i].elementName = '';
              this.computables[i].elementValue = '';
              this.ratio[i] = false;
              break;
            }
          }
        }
      }
    );

    this.subEndMemberSet = this.eventGeneratorService.on(END_MEMBER_SET).subscribe(
      event => {
        if (!!this.computables) {
          let c = this.getComputableByMemberName(event.content);
          if (!!c)
            this.selectMember(c);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.subReset) {
      this.subReset.unsubscribe();
    }

    if (!!this.subEndMemberSet) {
      this.subEndMemberSet.unsubscribe();
    }
  }

  private getCachedData(): MixingData {
    let mixingData: MixingData = {};
    let stored = this.storeService.get(MIXING_CACHE);
    if (!!stored && !!stored.geoData) {
      mixingData.geoData = stored.geoData;
    }
    if (!!stored && !!stored.outResult) {
      mixingData.outResult = stored.outResult;
    }
    return mixingData;
  }

  private saveCachedData() {
    let mixingData: MixingData = {};
    let stored = this.storeService.get(MIXING_CACHE);
    if (!!stored) {
      mixingData = stored;
    }
    mixingData.geoData = this.geoData;
    mixingData.outResult = this.outResult;
    this.storeService.push({key: MIXING_CACHE, data: mixingData}, this.eventGeneratorService);
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

  public close(): void {
    if (this.params?.modalRef) {
      this.params.modalRef.close();
    }
  }

  public reset(): void {
    this.eventGeneratorService.emit({ key: RESET_SELECTION });
    this.resetComputables();
    for (let a of this.ratios._results) {
      a.nativeElement.checked = false;
    }
    for (let a of this.inverses._results) {
      a.nativeElement.checked = false;
    }
    for (let i = 0; i < this.ratio.length; i++) {
      this.ratio[i] = false;
    }
    this.result = undefined;
    this.addReady = false;
    this.outResult = new Array<ShowedRow>();
    this.tempResult = new Array<ShowedRow>();
    this.resultReady = false;
    if (this.computables) {
      this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[0].endMemberName });
      this.onMemberSelection(this.computables[0]);
    }
  }

  public clean(): void {
    // this.storeService.clean(OUT_RESULT);
    // this.storeService.clean(GEO_DATA);
    this.storeService.clean(MIXING_CACHE, this.eventGeneratorService);
    this.outResult = new Array<ShowedRow>();
    this.geoData = new Array<any>();
  }

  public add(): void {
    if (!!this.computables) {
      this.resetComputables();
      for (let a of this.ratios._results) {
        a.nativeElement.checked = false;
      }
      for (let a of this.inverses._results) {
        a.nativeElement.checked = false;
      }
      for (let i = 0; i < this.ratio.length; i++) {
        this.ratio[i] = false;
      }
      for (let i = 0; i < this.ratio.length; i++) {
        this.ratio[i] = false;
        this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: false, active: this.computables[i].endMemberName, maxSelectable: 1 } });
      }
      if (this.computables) {
        this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[0].endMemberName });
        this.onMemberSelection(this.computables[0]);
      }
    }
  }

  private getComputableByMemberName(name: string): Computable | undefined {
    if (!!this.computables) {
      for (let c of this.computables) {
        if (c.endMemberName === name)
          return c;
      }
    }
    return undefined;
  }

  private getComputableByRow(row: number): Computable | undefined {
    if (!!this.computables) {
      for (let c of this.computables) {
        if (c.row === row)
          return c;
      }
    }
    return undefined;
  }

  public getSelected(event: any): void {
    // console.log(event);
    if (!!this.computables && !!this.endMembers) {
      let currentComputable = this.getComputableByMemberName(event.memberName);
      if (!!currentComputable) {
        if (!event.item.selected) {
          this.resetComputable(currentComputable);
        } else {
          if (!event.item.value || event.item.value.length === 0) {
            return;
          }
          if (!this.ratio[currentComputable.row]) {
            currentComputable.elementName = event.item.name;
            currentComputable.elementValue = event.item.value;
            if (event.item.type === 'I') {
              let element = this.getChemFromIsotope(event.item.name);
              element = element.toLowerCase()
              for (let em of this.endMembers) {
                if (em.name === event.memberName) {
                  for (let m of em.member) {
                    currentComputable.concentration = '';
                    currentComputable.concentrationValue = '';
                    if (m.name.toLowerCase().match(element) && m.name !== currentComputable.elementName && (!!m.value && m.value.length > 0)) {
                      currentComputable.concentration = m.name;
                      currentComputable.concentrationValue = m.value;
                      break;
                    }
                  }
                }
              }
            } else {
              currentComputable.concentration = '';
              currentComputable.concentrationValue = '';
            }
          } else {
            currentComputable.elementName = currentComputable.elementName + ' / ' + event.item.name;
            currentComputable.elementValue = '' + (parseFloat(currentComputable.elementValue) / parseFloat(event.item.value));
          }
        }
      }
      for (let i = 0; i < this.computables.length; i++) {
        if (this.computables[i].elementName.length === 0 && this.computables[i].elementValue.length === 0) {
          this.ratio[i] = false;
          this.ratios._results[i].nativeElement.checked = false;
          this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: false, active: this.computables[i].endMemberName, maxSelectable: 1 } });
        }
      }
    }
    this.submitOn = this.checkComputables();
  }

  private checkComputables(): boolean {
    if (!!this.computables) {
      for (let c of this.computables) {
        if (!c.elementValue || c.elementValue.length === 0)
          return false;
      }
      return true;
    }
    return false;
  }

  public getAnalyzedMembers(event: any) {
    this.endMembers = event;
    this.computables = new Array<Computable>();
    this.ratio = new Array<boolean>();
    let n = 0;
    for (let em of event) {
      this.ratio.push(false);
      this.computables.push({ endMemberName: em.name, elementName: '', elementValue: '', concentration: '', concentrationValue: '', row: n, active: false });
      n++;
    }
    this.computables[0].active = true;
    this.eventGeneratorService.emit({ key: END_MEMBER, content: event[0].name })
  }

  public onMemberSelection(c: Computable) {
    if (!!this.computables) {
      for (let cc of this.computables) {
        cc.active = false;
      }
      c.active = true;
      this.eventGeneratorService.emit({ key: END_MEMBER, content: c.endMemberName });
    }
  }

  public selectMember(c: Computable) {
    if (!!this.computables) {
      for (let cc of this.computables) {
        cc.active = false;
      }
      c.active = true;
    }
  }

  private getChemFromIsotope(isotope: string): string {
    let chem = '';
    chem = getElementByisotope(isotope);
    return chem;
  }

  private resetComputables(): void {
    this.submitOn = false;
    if (!!this.computables) {
      for (let em of this.computables) {
        em.elementName = '';
        em.elementValue = '';
        !!em.concentrationValue ? em.concentrationValue = '' : '';
        !!em.concentration ? em.concentration = '' : '';
      }
    }
  }

  private resetComputable(c: Computable) {
    c.elementName = '';
    c.elementValue = '';
    !!c.concentrationValue ? c.concentrationValue = '' : '';
    !!c.concentration ? c.concentration = '' : '';
  }

  public onRatio(event: any, c: Computable) {
    if (!!this.computables) {
      this.ratio[c.row] = event.target.checked;
      if (!!event.target.checked) {
        this.inverses._results[c.row].nativeElement.checked = false;
        if (c.elementName.startsWith('1 /')) c.elementName = '' + c.elementNameCopy;
      }
      this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: event.target.checked, active: c.endMemberName, maxSelectable: event.target.checked ? 2 : 1 } });
    }
  }

  public onInverse(event: any, c: Computable) {
    if (!!this.computables) {
      this.inverse[c.row] = event.target.checked;
      if (!!event.target.checked) {
        c.elementNameCopy = '' + c.elementName;
        if (!c.elementName.startsWith(' 1 /')) c.elementName = '1 / ' + c.elementName;
        c.elementValueCopy = '' + c.elementValue;
        let v = parseFloat(c.elementValue);
        v = 1 / v;
        c.elementValue = '' + v;
        this.ratios._results[c.row].nativeElement.checked = false;
      } else {
        c.elementName = '' + c.elementNameCopy;
        c.elementValue = '' + c.elementValueCopy;
      }
    }
  }

  public submit() {
    if (!!this.computables) {
      const payload = this.computables;
      let s = this.geoModelsService.mixingModel(payload, this.step).subscribe(
        (res: any) => {
          this.tempResult = new Array<ShowedRow>();
          this.result = res.results;
          this.geoData = [...this.geoData, ...res.geoData];
          // this.storeService.push({ key: GEO_DATA, data: this.geoData });

          if (!!this.result) {
            let nRow = this.result[0].samples.length;
            for (let n = 0; n < nRow; n++) {
              let r = new Array<string>();
              r.push(this.result[0].samples[n].member + ": " + this.result[0].samples[n].element);
              this.tempResult.push({ row: r });
            }
            let r = new Array<string>();
            r.push('MIX');
            this.tempResult.push({ row: r });

            for (let r of this.result) {
              for (let n = 0; n < nRow; n++) {
                this.tempResult[n].row.push('' + r.samples[n].f);
              }
              this.tempResult[this.tempResult.length - 1].row.push('' + r.mix);
            }
          }
          this.outResult = [...this.outResult, ...this.tempResult];
          // this.storeService.push({ key: OUT_RESULT, data: this.outResult });
          this.saveCachedData();
          this.resultReady = true;
          s.unsubscribe();
          this.addReady = true;
          this.add();
        }
      )
    }
  }

  public export() {
    let out = '';
    if (!this.outResult || this.outResult.length === 0) {
      return;
    }

    let max = this.getMaxLength();

    for (let i = 0; i < max; i++) {
      for (let j = 0; j < this.outResult.length; j++) {
        out += (!!this.outResult[j].row[i] ? this.outResult[j].row[i] : '') + ';';
      }
      out += '\n';
      out = out.replace(/\./g, ',');
    }
    saveCsvFile(out);
  }

  private getCardinality(data: any): number {
    for (let i = 0; i < data.length; i++) {
      if (data[i].row[0] === 'MIX')
        return i + 1;
    }
    return 0;
  }

  private getChartNumber(data: any): number {
    let counter = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].row[0] === 'MIX')
        counter++;
    }
    return counter * this.compute(counter);
  }

  private compute(n: number): number {
    if (n === 1) {
      return 0;
    }
    return n - 1 + this.compute(n - 1);
  }

  public chart(): void {
    this.chartView = true;
    // let data = this.storeService.get(OUT_RESULT);
    // console.log(data);
    // let geoData = this.storeService.get(GEO_DATA);
    // console.log(geoData);

    let stored = this.getCachedData();
    let data = stored.outResult;
    let geoData = stored.geoData;

    let xText = geoData[0].members[0].element;
    let yText = geoData[1].members[0].element;

    let cardinality = this.getCardinality(data);
    if (cardinality === 0)
      return;

    if (data.length > 0 && data.length % cardinality === 0) {
      let chartsData = this.getChartsData(data);
      if (chartsData.length < 2) {
        this.chartView = false;
        return;
      }

      let charts = new Array();

      for (let i = 0; i < chartsData.length; i += 2) {
        if (i + 1 < chartsData.length) {
          let dp = new Array<any>();
          for (let k = 0; k < chartsData[i].points.length; k++) {
            dp.push({ x: chartsData[i].points[k], y: chartsData[i + 1].points[k] });
          }
          charts.push({
            type: 'scatter',
            name: 'Mixed points', // chartsData[i].title + ' ' + chartsData[i + 1].title,
            showInLegend: true,
            dataPoints: dp,
          });
        }
      }

      console.log(charts);

      let dpem = new Array<any>();
      for (let i = 0; i < geoData.length - 1; i++) {
        for (let j = 0; j < geoData[i].members.length; j++) {
          dpem.push({ x: geoData[i].members[j].concentration, y: geoData[i + 1].members[j].concentration });
        }
      }

      for (let j = 0; j < geoData[0].members.length; j++) {
        dpem.push({ x: geoData[0].members[j].concentration, y: geoData[geoData.length - 1].members[j].concentration });
      }

      charts.push({
        type: 'line',
        dataPoints: dpem
      });

      this.chartOptions = {
        animationEnabled: true,
        theme: "light2",
        exportEnabled: true,
        zoomEnabled: true,
        width: this.chartWidth,
        height: this.chartHeight,  
        // title: {
        //   text: "Mixing model",
        // },
        axisX: {
          title: '' + xText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize  
        },
        axisY: {
          title: '' + yText,
          titleFontSize: this.fontSize,
          labelFontSize: this.fontSize  
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
  }

  private getChartsData(data: any): Array<chartData> {
    let charts = new Array<chartData>();
    let title = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].row[0] === 'MIX') {
        let points = new Array();
        for (let j = 1; j < data[i].row.length; j++) {
          points.push(parseFloat(data[i].row[j]));
        }
        charts.push({
          title: title,
          points: points
        });
        title = '';
      } else
        title += data[i].row[0] + '; '
    }
    return charts;
  }

  private getMaxLength(): number {
    let max = this.outResult[0].row.length;
    for (let i = 1; i < this.outResult.length; i++) {
      if (max < this.outResult[i].row.length) {
        max = this.outResult[i].row.length;
      }
    }
    return max;
  }

  getChartInstance(chart: object) {
    this.charts = chart;
  }

  public plot(geoData: any, geoModelsService: GeoModelsService) {
    let that = this;
    this.ref = this.modalService.open(PlotComponent, { centered: true });
    this.ref.componentInstance.emitter.subscribe((result: any) => {
      if (result.cmd === PLOT) {
        this.xPoint = result.xPoint;
        this.yPoint = result.yPoint;
        if (!!this.chartOptions && !!this.chartOptions.data) {
          let data = [...this.chartOptions.data];
          let userData = undefined;
          for (let d of data) {
            if (!!d.name && d.name === 'User plotted point')
              userData = d;
          }
          if (!userData) {
            data.push({
              type: 'scatter',
              name: 'User plotted point',
              showInLegend: true,
              markerType: 'square',
              color: 'red',
              click: function (e: any) {
                console.log(e.dataPoint);
                let xs = new Array<MixingModelPayload>();
                let ys = new Array<MixingModelPayload>();
  
                xs = [...geoData[0].members];
                ys = [...geoData[1].members];
  
                let payload = {
                  xPoint: e.dataPoint.x,
                  yPoint: e.dataPoint.y,
                  xs: xs,
                  ys: ys
                };
  
                console.log(payload);
  
                let s = geoModelsService.mixingPlot(payload).subscribe(
                  (res: any) => {
                    console.log(res);
                    let ref = that.modalService.open(AlertComponent, { centered: true });
                    if ( typeof(res) === 'string' && res.startsWith('Error')) {
                      let params: ModalParams = {
                        headerText: 'Info',
                        bodyText: 'The selected point cannot be produced by a mixing of the related endmembers.'
                      };
                      ref.componentInstance.params = params;
                    } else {
                      let list = [];
                      for (let i = 0; i < res.weights.length; i++) {
                        list.push({ key: res.geoData.xs[i].member, value: res.weights[i] })
                      }
                      let params: ModalParams = {
                        headerText: 'Info',
                        bodyText: 'The selected point can be produced by a mixing of the related endmembers.',
                        list: list
                      };
                      ref.componentInstance.params = params;
                    }
                    ref.componentInstance.emitter.subscribe(() => ref.close());
                    s.unsubscribe();
                  }
                );
              },
              dataPoints: [{ x: this.xPoint, y: this.yPoint }]
            });           
          } else {
            userData.dataPoints.push({ x: this.xPoint, y: this.yPoint });
          }

          this.chartOptions.data.length = 0;
          this.charts.render();
          this.chartOptions.data = data;
          this.charts.render();
        }
      }
      this.ref.close();
    });
  }
}

