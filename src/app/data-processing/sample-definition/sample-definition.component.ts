import { Component, OnInit, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService, storeParam, storeType } from 'src/app/services/common/store.service';
import { DATA_GATHERING, DataGatheringSession } from 'src/app/data-processing/main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { SampleElement, ChemComponent } from 'src/app/models/sample';
import { SampleService } from 'src/app/services/rest/sample.service';

export interface Col {
  name: string;
  col: number;
  isIsotope?: boolean;
}

@Component({
  selector: 'app-sample-definition',
  templateUrl: './sample-definition.component.html',
  styleUrls: ['./sample-definition.component.scss']
})
export class SampleDefinitionComponent extends DataGathering implements OnInit {
  public row: Array<string> = new Array<string>();
  public selectedStyle = 'transparent';
  public styles: storeType = [];
  @ViewChildren('fields') fields: any;
  @ViewChildren('samplefield') sampleFields: any;
  @ViewChildren('chemelement') chemFields: any;
  @ViewChildren('isotope') isotopes: any;
  @ViewChildren('none') nones: any;

  constructor(private router: Router,
    private sampleService: SampleService,
    private storeService: StoreService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session || !session.header) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.session = session;
      this.row = this.cleanRow(this.session);
      this.initStyles();
    }
  }

  public goNext(): void {

  }

  public goPrevious(): void {
    this.router.navigate(['content-manager2']);
  }

  public setStyle(index: string, val: number) {
    switch (val) {
      case 1:
        this.styles[index] = 'lightseagreen';
        break;
      case 2:
        this.styles[index] = 'lightsalmon';
        break;
      case 4:
        this.styles[index] = 'lightgreen';
        break;
      default:
        this.styles[index] = 'transparent';
        break;
    }
  }

  public updateSamples() {
    if (!!this.session) {
      console.log(this.session);
      this.collectSampleFields();
    }
  }

  private collectSampleFields(): void {
    let fields = new Array<string>();
    let chems = new Array<string>();
    let fieldCols = new Array<Col>();
    let chemCols = new Array<Col>();
    for (let j = 0; j < this.sampleFields._results.length; j++) {
      if (!!this.sampleFields._results[j].nativeElement.checked) {
        fields.push(this.sampleFields._results[j].nativeElement.name);
      } else if (!!this.chemFields._results[j].nativeElement.checked) {
        chems.push(this.chemFields._results[j].nativeElement.name);
      } else if (!!this.isotopes._results[j].nativeElement.checked) {
        chems.push('isotope::' + this.chemFields._results[j].nativeElement.name);
      }
    }
    if (!!this.session.header) {
      for (let i = 0; i < this.session.header?.length; i++) {
        for (let f of fields) {
          if (f === this.session.header[i]) {
            fieldCols.push({ name: f, col: i });
            break;
          }
        }
        for (let c of chems) {
          let n = c;
          let isoFlag = false;
          if (c.startsWith('isotope::')) {
            n = c.substring(9);
            isoFlag = true;
          }
          if (n === this.session.header[i]) {
            chemCols.push({ name: n, col: i, isIsotope: isoFlag });
            break;
          }
        }
      }
    }

    if (!!this.session.headerPosition) {
      if (!this.session.content)
        return;
      let lastRow = !!this.session.endTable ? this.session.endTable : this.session.content?.length;
      if (!lastRow)
        return;


      for (let i = this.session.headerPosition + 1, n = 0; i <= lastRow; i++, n++) {
        let fields = new Array<SampleElement>();
        for (let j = 0; j < this.session.content[i].length; j++) {
          for (let fc of fieldCols) {
            if (j === fc.col) {
              let se: SampleElement = { field: fc.name, value: this.session.content[i][j] };
              fields.push(se);
            }
          }
        }

        if (!this.session.samples[n]) {
          this.session.samples[n] = { fields: [] };
          for (let f of fields) {
            this.session.samples[n].fields.push(f);
          }
        } else {
          // deve tener conto che i dati possono essere su piu' tabelle ordinate in modo diverso.

        }

      }

      if (this.session.samples.length > 0 && chemCols.length > 0) {
        for (let i = this.session.headerPosition + 1; i <= lastRow; i++) {
          let sample = this.session.samples[i - this.session.headerPosition - 1];
          let components = new Array<ChemComponent>();
          for (let j = 0; j < this.session.content[i].length; j++) {
            for (let cc of chemCols) {
              if (j === cc.col) {
                let ce: ChemComponent = {
                  component: cc.name, value: this.session.content[i][j],
                  isIsotope: !!cc.isIsotope ? cc.isIsotope : false
                };
                components.push(ce);
              }
            }
          }
          sample.components = components;
        }
      }

      console.log(this.session.samples);
    }

  }

  public markAll(val: number) {
    for (let r of this.row) {
      switch (val) {
        case 1:
          this.styles[r] = 'lightseagreen';
          for (let j = 0; j < this.sampleFields._results.length; j++) {
            this.sampleFields._results[j].nativeElement.checked = true;
          }
          break;
        case 2:
          this.styles[r] = 'lightsalmon';
          for (let j = 0; j < this.chemFields._results.length; j++) {
            this.chemFields._results[j].nativeElement.checked = true;
          }
          break;
        case 4:
          this.styles[r] = 'lightgreen';
          for (let j = 0; j < this.chemFields._results.length; j++) {
            this.isotopes._results[j].nativeElement.checked = true;
          }
          break;
        default:
          this.styles[r] = 'transparent';
          for (let j = 0; j < this.nones._results.length; j++) {
            this.nones._results[j].nativeElement.checked = true;
          }
          break;
      }
    }
  }

  public getSamples(): void {

  }

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
    for (let r of this.row) {
      this.styles[r] = 'transparent';
    }
  }

  public saveSamples(): void {
    this.sampleService.insertSample(this.session.samples).subscribe(
      (res) => {
        console.log(res);
      }
    );
  }

}
