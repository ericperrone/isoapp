import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { GeoModel, EndMemberItem } from 'src/app/services/common/geo-model.service';
import { EndMember, MULTIPLE_SELECTION_MODE } from '../end-member/end-member.component';
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
  public ratio = false;
  public isCollapsed = true;
  public result: MixingResult | undefined;
  private firstSelectionItem: any;

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

  public getSelected(event: any) {
    console.log(event);
    let sorted = Array<EndMember>();
    if (!!event.item.selected && event.item.selected === true) {
      if (!!this.endMembers) {
        sorted = Array<EndMember>(this.endMembers.length);
        let index = 0;
        for (let em of this.endMembers) {
          if (em.name === event.memberName) {
            sorted[index] = em;
            break;
          }
        }

        index = 1;
        if (index >= this.endMembers.length) {
          return;
        }

        for (let em of this.endMembers) {
          if (em.name !== event.memberName) {
            sorted[index] = em;
            index++;
          }
        }

        if (this.ratio === false) {
          this.firstSelectionItem = event;
          if (!!this.computables) {
            for (let i = 0; i < sorted.length; i++) {
              this.computables[i].endMemberName = sorted[i].name;
              this.computables[i].elementName = event.item.name;
              for (let s of sorted[i].member) {
                if (s.name === event.item.name) {
                  this.computables[i].elementValue = s.value;
                }
              }
            }
            if (this.firstSelectionItem.item.type === 'I') {
              console.log(sorted);
              let element = this.getChemFromIsotope(this.firstSelectionItem.item.name);
              for (let i = 0; i < sorted.length; i++) {
                for (let j = 0; j < sorted[i].member.length; j++) {
                  if (sorted[i].member[j].name.indexOf(element) >= 0 && sorted[i].member[j].name !== this.firstSelectionItem.item.name) {
                    this.computables[i].concentration = sorted[i].member[j].name;
                    this.computables[i].concentrationValue = sorted[i].member[j].value;
                    break;
                  }
                }
              }
              console.log(this.computables);
            }
          }
        } else {
          if (!!this.computables && !!this.firstSelectionItem && !!this.params) {
            for (let i = 0; i < sorted.length; i++) {
              this.computables[i].endMemberName = sorted[i].name;
              this.computables[i].elementName = this.firstSelectionItem.item.name + ' / ' + event.item.name;
              for (let mm of this.endMembers) {
                if (mm.name === this.computables[i].endMemberName) {
                  for (let mmm of mm.member) {
                    if (mmm.name === event.item.name) {
                      this.computables[i].elementValue = '' + (parseFloat(this.computables[i].elementValue) / parseFloat(mmm.value));
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      this.resetComputables();
    }
  }

  public getAnalyzedMembers(event: any) {
    // console.log(event);
    this.endMembers = event;
    this.computables = new Array<Computable>();
    for (let em of event) {
      this.computables.push({ endMemberName: '', elementName: '', elementValue: '0' });
    }
  }

  public onOptionSelected(em: any): void {
    // console.log(em);
    // if(!!this.endMembers) {
    //   for (let e of this.endMembers) {
    //     if (e.name === this.firstMemberName) {
    //       this.firstMember = e;
    //     }
    //   }
    //   console.log(this.firstMember);
    // }
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
        em.endMemberName = '';
        em.elementName = '';
        em.elementValue = '0';
      }
    }
  }

  public onRatio(event: any) {
    this.ratio = event.target.checked;
    for (let a of this.ratios._results) {
      a.nativeElement.checked = this.ratio;
    }
    this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: this.ratio });
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
