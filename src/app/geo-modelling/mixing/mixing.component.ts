import { Component, OnInit, OnDestroy, Input, ViewChildren } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { GeoModel } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION, END_MEMBER, MULTIPLE_SELECTION_MODE, RESET_SELECTION_OUT } from '../end-member/end-member.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { saveCsvFile } from 'src/app/shared/tools';
import { Subscription } from 'rxjs';

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
  public computablesBack: Array<Computable> | undefined;
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
  private subReset: Subscription | undefined;

  constructor(private eventGeneratorService: EventGeneratorService,
    private geModelsService: GeoModelsService) { }

  ngOnInit(): void {
    // console.log(this.params);
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

  public add(): void {
    this.eventGeneratorService.emit({ key: RESET_SELECTION });
    this.resetComputables();
    for (let a of this.ratios._results) {
      a.nativeElement.checked = false;
    }
    for (let i = 0; i < this.ratio.length; i++) {
      this.ratio[i] = false;
    }
    if (this.computables) {
      this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[0].endMemberName });
      this.onMemberSelection(this.computables[0]);
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
              for (let em of this.endMembers) {
                if (em.name === event.memberName) {
                  for (let m of em.member) {
                    if (m.name.indexOf(element) >= 0 && m.name !== element) {
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
    this.computablesBack = new Array<Computable>();
    this.ratio = new Array<boolean>();
    let n = 0;
    for (let em of event) {
      this.ratio.push(false);
      this.computables.push({ endMemberName: em.name, elementName: '', elementValue: '', row: n, active: false });
      this.computablesBack.push({ endMemberName: em.name, elementName: '', elementValue: '', row: n, active: false });
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
    for (let i = 0; i < isotope.length; i++) {
      if (isotope.charAt(i) >= '0' && isotope.charAt(i) <= '9')
        return chem;
      chem += '' + isotope.charAt(i);
    }
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
          console.log(this.result);
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
          this.resultReady = true;
          s.unsubscribe();
          this.addReady = true;
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
