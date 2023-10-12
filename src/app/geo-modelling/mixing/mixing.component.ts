import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { GeoModel, EndMemberItem } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION, END_MEMBER, MULTIPLE_SELECTION_MODE } from '../end-member/end-member.component';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { GeoModelsService, MixingModelPayload } from 'src/app/services/rest/geo-models.service';
import { saveCsvFile } from 'src/app/shared/tools';

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
  element: string,
  member1: string,
  member2: string,
  mix: Array<{ weight: number, mix: number }>;
}

@Component({
  selector: 'app-mixing',
  templateUrl: './mixing.component.html',
  styleUrls: ['./mixing.component.scss']
})
export class MixingComponent implements OnInit {
  @Input('params') params: GeoModel | undefined;
  @ViewChildren('ratio') ratios: any;
  public members = new Array<MemberItem>();
  public endMembers: Array<EndMember> | undefined;
  public computables: Array<Computable> | undefined;
  public computablesBack: Array<Computable> | undefined;
  public ratio = new Array<boolean>();
  public isCollapsed = true;
  public result: MixingResult | undefined;
  public currentSelectionItem: any;

  constructor(private eventGeneratorService: EventGeneratorService,
    private geModelsService: GeoModelsService) { }

  ngOnInit(): void {
    // console.log(this.params);
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
    console.log(event);
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
              // console.log(sorted);
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

            // if (currentComputable.row < this.computables?.length) {
            //   this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[1 + currentComputable.row].endMemberName });
            // }
          } else {
            currentComputable.elementName = currentComputable.elementName + ' / ' + event.item.name;
            currentComputable.elementValue = '' + (parseFloat(currentComputable.elementValue) / parseFloat(event.item.value));
            // if (currentComputable.row < this.computables?.length) {
            //   this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[1 + currentComputable.row].endMemberName });
            // }
          }
        }
      }
    }
  }

  public getAnalyzedMembers(event: any) {
    console.log(event);
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
    if (!!this.computables) {
      for (let em of this.computables) {
        // em.endMemberName = '';
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
      this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: event.target.checked });
      // if (!!this.ratio[c.row]) {
      //   this.eventGeneratorService.emit({ key: END_MEMBER, content: this.computables[c.row].endMemberName });
      //   this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: true });
      // } else {
      //   this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: false });
      // }
    }
   }

  public submit() {
    if (!!this.computables) {
      const payload = this.computables;
      let s = this.geModelsService.mixingModel(payload).subscribe(
        (res: any) => {
          console.log(res);
          this.result = {
            element: res[0].element,
            member1: res[0].memberA,
            member2: res[0].memberB,
            mix: res[0].mix
          }
          console.log(this.result);
          s.unsubscribe();
        }
      )
    }
  }

  public export() {
    if (!!this.result) {
      let out = '';
      out += this.result.element + '\n';
      out += this.result.member1 + '\n';
      out += this.result.member2 + '\n';
      out += 'weight; value\n';
      for (let m of this.result.mix) {
        out += '' + m.weight + ';' + m.mix + '\n';
      }
      saveCsvFile(out);
    }
  }
}
