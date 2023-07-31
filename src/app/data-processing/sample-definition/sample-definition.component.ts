import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { StoreService, storeParam, storeType } from 'src/app/services/common/store.service';
import { DATA_GATHERING, DataGatheringSession } from 'src/app/data-processing/main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { SampleElement, ChemComponent, Sample } from 'src/app/models/sample';
import { trigger, style, animate, transition } from '@angular/animations';
import { checkChemElement, checkField, checkIsotope } from 'src/app/shared/const';
import { Subscription } from 'rxjs';

export interface Col {
  name: string;
  col: number;
  type: SampleType;
}

export enum SampleType { FIELD = 1, CHEM, ISOTOPE, NONE };

export interface SampleItem {
  item: string;
  type: SampleType;
}

@Component({
  selector: 'app-sample-definition',
  templateUrl: './sample-definition.component.html',
  styleUrls: ['./sample-definition.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SampleDefinitionComponent extends DataGathering implements OnInit, OnDestroy {
  public ST = SampleType;
  public row: Array<string> = new Array<string>();
  public sampleDef: Array<SampleItem> = new Array<SampleItem>();
  public selectedStyle = 'transparent';
  public styles: storeType = [];
  public dataComposed = false;
  private subscription: Subscription | undefined;
  public buttonEnabled = false;

  // @ViewChildren('fields') fields: any;
  // @ViewChildren('samplefield') sampleFields: any;
  // @ViewChildren('chemelement') chemFields: any;
  // @ViewChildren('isotope') isotopes: any;
  // @ViewChildren('none') nones: any;

  constructor(private router: Router,
    private storeService: StoreService) {
    super();
    this.buttonEnabled = false;
  }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    console.log(session);
    if (!session || !session.header) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.session = session;
      this.row = this.cleanRow(this.session);
      this.loadComponents();
      this.initStyles();
    }
  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadComponents() {
    if (!!this.row) {
      this.sampleDef = new Array<SampleItem>();
      for (let r of this.row) {
        if (checkField(r)) {
          this.sampleDef.push({ item: r, type: SampleType.FIELD });
          continue;
        }
        if (checkChemElement(r)) {
          this.sampleDef.push({ item: r, type: SampleType.CHEM });
          continue;
        }
        if (checkIsotope(r)) {
          this.sampleDef.push({ item: r, type: SampleType.ISOTOPE });
          continue;
        }
        this.sampleDef.push({ item: r, type: SampleType.NONE });
      }
    }
    this.checkDataComposition();
  }

  private checkDataComposition(): void {
    for (let s of this.sampleDef) {
      if (s.type !== SampleType.NONE) {
        this.dataComposed = true;
        return;
      }
    }
    this.dataComposed = false;
  }

  public goNext(): void {
    if (this.dataComposed === false)
      return;
    this.updateSamples();
    this.buildPayload();
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
    console.log(this.storeService.get(DATA_GATHERING));
    this.router.navigate(['save-data']);
  }

  public goPrevious(): void {
    this.router.navigate(['content-manager']);
  }

  public setStyle(si: SampleItem, type: SampleType): void {
    switch (type) {
      case SampleType.FIELD:
        this.styles[si.item] = 'lightseagreen';
        break;
      case SampleType.CHEM:
        this.styles[si.item] = 'lightsalmon';
        break;
      case SampleType.ISOTOPE:
        this.styles[si.item] = 'lightgreen';
        break;
      default:
        this.styles[si.item] = 'transparent';
        break;
    }
    si.type = type;
    this.checkDataComposition();
  }


  public updateSamples() {
    if (!!this.session) {
      console.log(this.session);
      this.session.fields = new Array<string>();
      this.session.chems = new Array<string>();
      this.session.isotopes = new Array<string>();
      for (let s of this.sampleDef) {
        switch (s.type) {
          case SampleType.FIELD:
            this.session.fields.push(s.item);
            break;
          case SampleType.CHEM:
            this.session.chems.push(s.item);
            break;
          case SampleType.ISOTOPE:
            this.session.isotopes.push(s.item);
            break;
        }
      }
    }
  }

  private buildPayload(): void {
    if (!!this.session.header && !!this.session.content) {
      let headerCols = new Array<Col>();
      for (let i = 0; i < this.session.header.length; i++) {
        for (let sd of this.sampleDef) {
          if (sd.item === this.session.header[i]) {
            headerCols.push({ name: sd.item, col: i, type: sd.type });
            break;
          }
        }
      }

      for (let i = this.session.headerPosition + 1; i <= this.session.endTable; i++) {
        let row = this.session.content[i];
        let sample: Sample = { fields: new Array<SampleElement>(), components: new Array<ChemComponent>() };
        for (let j = 0; j < row.length; j++) {
          let element = row[j];
          for (let hc of headerCols) {
            if (j === hc.col) {
              switch (hc.type) {
                case SampleType.FIELD:
                  sample.fields.push({ field: hc.name, value: element });
                  break;
                case SampleType.CHEM:
                  sample.components.push({ component: hc.name, value: element, isIsotope: false });
                  break;
                case SampleType.ISOTOPE:
                  sample.components.push({ component: hc.name, value: element, isIsotope: true });
                  break;
              }
            }
          }
          this.session.samples.push(sample)
        }
      }

      this.storeService.push({ key: DATA_GATHERING, data: this.session });
    }
  }

  // private collectSampleFields(): void {
  //   let fields = new Array<string>();
  //   let chems = new Array<string>();
  //   let fieldCols = new Array<Col>();
  //   let chemCols = new Array<Col>();

  //   this.session.fields = new Array<string>();
  //   this.session.chems = new Array<string>();
  //   this.session.isotopes = new Array<string>();

  //   for (let j = 0; j < this.sampleFields._results.length; j++) {
  //     if (!!this.sampleFields._results[j].nativeElement.checked) {
  //       fields.push(this.sampleFields._results[j].nativeElement.name);
  //       if (!this.session.fields.find(element => element === this.sampleFields._results[j].nativeElement.name))
  //         this.session.fields.push(this.sampleFields._results[j].nativeElement.name);
  //     } else if (!!this.chemFields._results[j].nativeElement.checked) {
  //       chems.push(this.chemFields._results[j].nativeElement.name);
  //       if (!this.session.chems.find(element => element === this.chemFields._results[j].nativeElement.name))
  //         this.session.chems.push(this.chemFields._results[j].nativeElement.name);
  //     } else if (!!this.isotopes._results[j].nativeElement.checked) {
  //       chems.push('isotope::' + this.chemFields._results[j].nativeElement.name);
  //       if (!this.session.isotopes.find(element => element === this.chemFields._results[j].nativeElement.name))
  //         this.session.isotopes.push(this.chemFields._results[j].nativeElement.name);
  //     }
  //     console.log(this.session.chems);
  //   }

  //   if (!!this.session.header) {
  //     for (let i = 0; i < this.session.header?.length; i++) {
  //       for (let f of fields) {
  //         if (f === this.session.header[i]) {
  //           fieldCols.push({ name: f, col: i });
  //           break;
  //         }
  //       }
  //       for (let c of chems) {
  //         let n = c;
  //         let isoFlag = false;
  //         if (c.startsWith('isotope::')) {
  //           n = c.substring(9);
  //           isoFlag = true;
  //         }
  //         if (n === this.session.header[i]) {
  //           chemCols.push({ name: n, col: i, isIsotope: isoFlag });
  //           break;
  //         }
  //       }
  //     }
  //   }

  //   if (this.session.headerPosition !== undefined && this.session.headerPosition >= 0) {
  //     if (!this.session.content)
  //       return;
  //     let lastRow = !!this.session.endTable ? this.session.endTable : this.session.content?.length;
  //     if (!lastRow)
  //       return;


  //     for (let i = this.session.headerPosition + 1, n = 0; i <= lastRow; i++, n++) {
  //       let fields = new Array<SampleElement>();
  //       for (let j = 0; j < this.session.content[i].length; j++) {
  //         for (let fc of fieldCols) {
  //           if (j === fc.col) {
  //             let se: SampleElement = { field: fc.name, value: this.session.content[i][j] };
  //             fields.push(se);
  //           }
  //         }
  //       }

  //       if (!this.session.samples[n]) {
  //         this.session.samples[n] = { fields: [] };
  //         for (let f of fields) {
  //           this.session.samples[n].fields.push(f);
  //         }
  //       } else {
  //         // deve tener conto che i dati possono essere su piu' tabelle ordinate in modo diverso.

  //       }

  //     }

  //     if (this.session.samples.length > 0 && chemCols.length > 0) {
  //       for (let i = this.session.headerPosition + 1; i <= lastRow; i++) {
  //         let sample = this.session.samples[i - this.session.headerPosition - 1];
  //         let components = new Array<ChemComponent>();
  //         for (let j = 0; j < this.session.content[i].length; j++) {
  //           for (let cc of chemCols) {
  //             if (j === cc.col) {
  //               let ce: ChemComponent = {
  //                 component: cc.name, value: this.session.content[i][j],
  //                 isIsotope: !!cc.isIsotope ? cc.isIsotope : false
  //               };
  //               components.push(ce);
  //             }
  //           }
  //         }
  //         sample.components = components;
  //       }
  //     }

  //     console.log(this.session.samples);
  //     this.dataComposed = true;
  //   }

  // }

  // public markAll(val: number) {
  //   for (let r of this.row) {
  //     switch (val) {
  //       case 1:
  //         this.styles[r] = 'lightseagreen';
  //         for (let j = 0; j < this.sampleFields._results.length; j++) {
  //           this.sampleFields._results[j].nativeElement.checked = true;
  //         }
  //         break;
  //       case 2:
  //         this.styles[r] = 'lightsalmon';
  //         for (let j = 0; j < this.chemFields._results.length; j++) {
  //           this.chemFields._results[j].nativeElement.checked = true;
  //         }
  //         break;
  //       case 4:
  //         this.styles[r] = 'lightgreen';
  //         for (let j = 0; j < this.chemFields._results.length; j++) {
  //           this.isotopes._results[j].nativeElement.checked = true;
  //         }
  //         break;
  //       default:
  //         this.styles[r] = 'transparent';
  //         for (let j = 0; j < this.nones._results.length; j++) {
  //           this.nones._results[j].nativeElement.checked = true;
  //         }
  //         break;
  //     }
  //   }
  //   this.buttonEnabled = true;
  //   // this.enableButton();
  // }

  // public getSamples(): void {

  // }

  private cleanRow(session: DataGatheringSession): Array<string> {
    let r = new Array<string>();
    if (!!session.header)
      for (let s of session.header) {
        if (!!s && s.length > 0) {
          r.push(s);
        }
      }
    return r;
  }

  private initStyles(): void {
    for (let s of this.sampleDef) {
      this.setStyle(s, s.type);
    }
  }

}
