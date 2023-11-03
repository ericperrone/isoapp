import { Component, OnInit, OnDestroy, Input, ViewChildren } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION, END_MEMBER, MULTIPLE_SELECTION_MODE, RESET_SELECTION_OUT } from '../end-member/end-member.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { saveCsvFile } from 'src/app/shared/tools';
import { Subscription } from 'rxjs';
import { CACHE_AUTH, getElementByisotope } from 'src/app/shared/const';
import { StoreService } from 'src/app/services/common/store.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

export const OUT_RESULT = '_OUT_RESULT_';

interface MemberItem {
  endMemberName: string;
  value: string;
}

interface Computable {
  endMemberName: string;
  elementName: string;
  elementValue: string;
  row: number;
  active: boolean;
  concentration?: string;
  concentrationValue?: string;
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
  @Input('params') params: GeoModel | undefined;
  @ViewChildren('ratio') ratios: any;
  public members = new Array<MemberItem>();
  public endMembers: Array<EndMember> | undefined;
  public computables: Array<Computable> | undefined;
  public chartView = false;
  public submitOn = false;
  public ratio = new Array<boolean>();
  public isCollapsed = true;
  public result: Array<MixingResult> | undefined;
  public currentSelectionItem: any;
  public step: number = 0.05;
  public outResult = new Array<ShowedRow>();
  private tempResult = new Array<ShowedRow>();
  public resultReady = false;
  public addReady = false;
  public chartOptions = {};
  private subReset: Subscription | undefined;

  constructor(private eventGeneratorService: EventGeneratorService,
    private storeService: StoreService,
    private geModelsService: GeoModelsService) { }

  ngOnInit(): void {
    // console.log(this.params);
    this.outResult = this.storeService.get(OUT_RESULT);
    if (!this.outResult) {
      this.outResult = new Array<ShowedRow>();
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
  }

  ngOnDestroy(): void {
    if (!!this.subReset) {
      this.subReset.unsubscribe();
    }
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
    this.storeService.clean(OUT_RESULT);
    this.outResult = new Array<ShowedRow>();
  }

  public add(): void {
    // this.eventGeneratorService.emit({ key: RESET_SELECTION });
    if (!!this.computables) {
      this.resetComputables();
      for (let a of this.ratios._results) {
        a.nativeElement.checked = false;
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
                    if (m.name.toLowerCase().match(element) && m.name !== currentComputable.elementName && (!!m.value && m.value.length > 0)) {
                      currentComputable.concentration = m.name;
                      currentComputable.concentrationValue = m.value;
                      break;
                    }
                  }
                }
              }
            } else {
              currentComputable.concentration = undefined;
              currentComputable.concentrationValue = undefined;
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
    // console.log(event);
    this.endMembers = event;
    this.computables = new Array<Computable>();
    // if (!this.computablesBack)
    // this.computablesBack = new Array<Computable>();
    // else this.computables = [...this.computablesBack];
    this.ratio = new Array<boolean>();
    let n = 0;
    for (let em of event) {
      this.ratio.push(false);
      this.computables.push({ endMemberName: em.name, elementName: '', elementValue: '', row: n, active: false });
      // this.computablesBack.push({ endMemberName: em.name, elementName: '', elementValue: '', row: n, active: false });
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
        !!em.concentrationValue ? em.concentrationValue = undefined : undefined;
        !!em.concentration ? em.concentration = undefined : undefined;
      }
    }
  }

  private resetComputable(c: Computable) {
    c.elementName = '';
    c.elementValue = '';
    !!c.concentrationValue ? c.concentrationValue = undefined : undefined;
    !!c.concentration ? c.concentration = undefined : undefined;
  }

  public onRatio(event: any, c: Computable) {
    if (!!this.computables) {
      this.ratio[c.row] = event.target.checked;
      this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: { checked: event.target.checked, active: c.endMemberName, maxSelectable: event.target.checked ? 2 : 1 } });
    }
  }

  public submit() {
    if (!!this.computables) {
      const payload = this.computables;
      let s = this.geModelsService.mixingModel(payload, this.step).subscribe(
        (res: any) => {
          this.tempResult = new Array<ShowedRow>();
          this.result = res;
          // console.log(this.result);
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
          this.storeService.push({ key: OUT_RESULT, data: this.outResult });
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

  // private getEndMebers(data: any): Array<Array<any>> {
  //   let endms = new Array<Array<number>>();
  //   let cardinality = this.getCardinality(data);
  //   if (cardinality > 0) {
  //     for (let i = 0; i < data.length; i += cardinality) {
  //       let ems = new Array<any>();
  //       for (let j = 1; j < data[i].row.length; j++) {
  //         for (let c = cardinality - 2; c >= 0; c--) {
  //           if (data[i + c].row[j] === '1') {
  //             ems.push({ x: parseFloat(data[i].row[j]), y: parseFloat(data[i + cardinality - 1].row[j]) });
  //           }
  //         }
  //       }
  //       endms.push(ems);
  //     }
  //   }
  //   for (let e of endms) {
  //     e.push(e[0]);
  //   }
  //   return endms;
  // }


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
    let data = this.storeService.get(OUT_RESULT);
    console.log(data);

    let step = parseFloat(data[0].row[2]);

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
            type: 'line',
            name: chartsData[i].title + ' ' + chartsData[i + 1].title,
            showInLegend: true,
            dataPoints: dp
          });
        }
      }

      console.log(charts);

      this.chartOptions = {
        animationEnabled: true,
        theme: "light2",
        title: {
          text: "Mixing model"
        },
        axisX: {
          title: '',
          // valueFormatString: "MMM",
          // intervalType: "month",
          // interval: 1
        },
        axisY: {
          title: '',
          // suffix: "°F"
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

  // public chart2(): void {
  //   this.chartView = true;
  //   let data = this.storeService.get(OUT_RESULT);
  //   console.log(data);
  //   let endems = this.getEndMebers(data);
  //   console.log(endems);

  //   let step = parseFloat(data[0].row[2]);

  //   let cardinality = this.getCardinality(data);
  //   if (cardinality === 0)
  //     return;

  //   if (data.length > 0 && data.length % cardinality === 0) {
  //     let endMemberNumber = cardinality - 1;
  //     let chartNumber = this.getChartNumber(data);
  //     if (chartNumber === 0) {
  //       chartNumber = 1;
  //     }
  //     console.log("nr. endmember: " + endMemberNumber + " nr. chart: " + chartNumber);

  //     let charts = new Array();

  //     for (let n = 0; n < chartNumber; n++) {
  //       let index = n * cardinality;
  //       let points = new Array();
  //       let start = 0;
  //       for (let i = 1, j = 1; i < data[index + cardinality - 1].row.length; i++, j++) {
  //         let x = start + step * (j - 1);
  //         if (x > 1) {
  //           charts.push({
  //             type: "scatter",
  //             name: "" + data[index].row[0],
  //             showInLegend: true,
  //             dataPoints: points
  //           });
  //           points = new Array();
  //           j = 0;
  //           x = start + step * j;
  //         }
  //         points.push({ x: x, y: parseFloat(data[index + cardinality - 1].row[i]) });
  //       }
  //       charts.push({
  //         type: "scatter",
  //         name: "" + data[index].row[0],
  //         showInLegend: true,
  //         dataPoints: points
  //       });
  //     }

  //     for (let e of endems) {
  //       charts.push({
  //         type: "line",
  //         name: "End members",
  //         showInLegend: true,
  //         dataPoints: e
  //       });
  //     }

  //     console.log(charts);

  //     this.chartOptions = {
  //       animationEnabled: true,
  //       theme: "light2",
  //       title: {
  //         text: "Mixing model"
  //       },
  //       axisX: {
  //         title: '',
  //         // valueFormatString: "MMM",
  //         // intervalType: "month",
  //         // interval: 1
  //       },
  //       axisY: {
  //         title: '',
  //         // suffix: "°F"
  //       },
  //       toolTip: {
  //         shared: true
  //       },
  //       legend: {
  //         cursor: "pointer",
  //         itemclick: function (e: any) {
  //           if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
  //             e.dataSeries.visible = false;
  //           } else {
  //             e.dataSeries.visible = true;
  //           }
  //           e.chart.render();
  //         }
  //       },
  //       data: charts
  //     }
  //   }
  // }

  private getMaxLength(): number {
    let max = this.outResult[0].row.length;
    for (let i = 1; i < this.outResult.length; i++) {
      if (max < this.outResult[i].row.length) {
        max = this.outResult[i].row.length;
      }
    }
    return max;
  }
}
