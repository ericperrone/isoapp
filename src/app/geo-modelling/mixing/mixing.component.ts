import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { GeoModel, EndMemberItem } from 'src/app/services/common/geo-model.service';
import { EndMember, RESET_SELECTION } from '../end-member/end-member.component';
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
  public computablesBack: Array<Computable> | undefined;
  public ratio = new Array<boolean>();
  public isCollapsed = true;
  public result: MixingResult | undefined;
  private firstSelectionItem: any;
  private secondSelectionItem: any;
  private currentItem: any

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
    this.eventGeneratorService.emit({key: RESET_SELECTION});
    this.resetComputables();
    this.firstSelectionItem = undefined;
    this.secondSelectionItem = undefined;
    for (let a of this.ratios._results) {
        a.nativeElement.checked = false;
        // a.nativeElement.disabled = true;
      }
  }

  public getSelected(event: any) {
    console.log(event);
    // let currentSelectionItem: any;

    if (!this.firstSelectionItem) {
      this.firstSelectionItem = event;
    } else if (!this.secondSelectionItem) {
      if (!event.item.selected) {
        this.firstSelectionItem = undefined;
      } else {
        this.secondSelectionItem = event;
      }
    } else {
      if (!event.item.selected) {
        this.secondSelectionItem = undefined;
      } else {
        this.secondSelectionItem = event;
      }
    }

    let sorted = Array<EndMember>();
    if (!!event.item.selected && event.item.selected === true) {
      if (!!this.endMembers) {
        sorted = Array<EndMember>(this.endMembers.length);
        for (let index = 0; index < this.endMembers.length; index++) {
          sorted[index] = this.endMembers[index];
        }

        // if (this.ratio === false) {
        this.currentItem = event;
        if (!!this.computables) {
          let i = 0;
          if (!!this.secondSelectionItem) {
            if (this.ratio[0] === false)
              i = 1;
          }

          if (!!this.computablesBack)
            for (let k = 0; k < this.computables.length; k++) {
              this.computablesBack[k] = { ...this.computables[k] };
            }

          this.computables[i].endMemberName = sorted[i].name;
          this.computables[i].elementName = event.item.name;
          for (let s of sorted[i].member) {
            if (s.name === event.item.name) {
              this.computables[i].elementValue = s.value;
            }
          }

          if (this.ratio[i] === true && !!this.computablesBack) {
            this.computables[i].endMemberName = sorted[i].name;
            this.computables[i].elementName = this.computablesBack[i].elementName + ' / ' + event.item.name;
            this.computables[i].elementValue = '' + (parseFloat(this.computablesBack[i].elementValue) / parseFloat(event.item.value));
            this.ratio[0] = false;
          }

          if (event.item.type === 'I') {
            // console.log(sorted);
            let element = this.getChemFromIsotope(event.item.name);
            for (let j = 0; j < sorted[i].member.length; j++) {
              if (sorted[i].member[j].name.indexOf(element) >= 0 && sorted[i].member[j].name !== this.firstSelectionItem.item.name) {
                this.computables[i].concentration = sorted[i].member[j].name;
                this.computables[i].concentrationValue = sorted[i].member[j].value;
                break;
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
    this.computablesBack = new Array<Computable>();
    this.ratio = new Array<boolean>();
    for (let em of event) {
      this.ratio.push(false);
      this.computables.push({ endMemberName: '', elementName: '', elementValue: '' });
      this.computablesBack.push({ endMemberName: '', elementName: '', elementValue: '' });
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
        em.endMemberName = '';
        em.elementName = '';
        em.elementValue = '';
      }
    }
  }

  public onRatio(event: any, c: Computable) {
    if (!!this.secondSelectionItem) {
      if (this.secondSelectionItem.memberName === c.endMemberName &&
        this.secondSelectionItem.item.name === c.elementName) {
        this.ratio[1] = event.target.checked;
        return;
      }
    }
    if (!!this.firstSelectionItem) {
      if (this.firstSelectionItem.memberName === c.endMemberName &&
        this.firstSelectionItem.item.name === c.elementName) {
        this.ratio[0] = event.target.checked;
        return;
      }
    }

    // for (let a of this.ratios._results) {
    //   a.nativeElement.checked = this.ratio;
    // }
    // this.eventGeneratorService.emit({ key: MULTIPLE_SELECTION_MODE, content: this.ratio });
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
