import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ConversionTable } from 'src/app/models/conversion';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { CANCEL, CONFIRM } from '../../modals/modal-params';
import { Computable } from 'src/app/geo-modelling/mixing/mixing.component';

export enum ConversionType { NONE = 0, BOTH, CHEM_ONLY, ISOTOPE_ONLY };

@Component({
  selector: 'app-conversion-dialog',
  templateUrl: './conversion-dialog.component.html',
  styleUrls: ['./conversion-dialog.component.scss']
})
export class ConversionDialogComponent implements OnInit {
  private conversionType: ConversionType = ConversionType.NONE;
  public conversionTable = new Array<ConversionTable>();
  private computables = new Array<Computable>();
  public emitter = new EventEmitter<any>();
  public UM = '';
  @Input() params: any;

  constructor(private geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    this.loadConversionTable();
    this.computables = this.params.computables;
    this.conversionType = this.params.type;
    // console.log(this.params);
    // console.log(this.computables);
    // console.log(this.conversionTable);
  }

  public confirm(): void {
    for (let c of this.computables) {
      switch (this.conversionType) {
        case ConversionType.CHEM_ONLY:
          this.convertChemOnly(c);
          break;
        case ConversionType.ISOTOPE_ONLY:
          this.convertIsotopeOnly(c);
          break;
        case ConversionType.BOTH:
          this.convertBoth(c);
          break;
      }
    }
    this.emitter.emit({ response: CONFIRM, data: this.computables });
  }

  private convertBoth(c: Computable): void {
    let currentUm = ('' + c.elementUm).toLowerCase();
    let currentConcentrationUm = ('' + c.concentrationUm).toLowerCase();
    if (currentUm !== this.UM) {
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.elementUm = this.UM;
          let value = parseFloat(c.elementValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.elementValue = '' + value;
        }
      }
    }
    if (currentConcentrationUm !== this.UM) {
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentConcentrationUm) {
          c.concentrationUm = this.UM;
          let value = parseFloat(c.concentrationValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.concentrationValue = '' + value;
        }
      }
    }
  }

  private convertChemOnly(c: Computable): void {
    let currentUm = ('' + c.elementUm).toLowerCase();
    if (currentUm !== this.UM)
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.elementUm = this.UM;
          let value = parseFloat(c.elementValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.elementValue = '' + value;
        }
      }
  }

  private convertIsotopeOnly(c: Computable): void {
    let currentUm = ('' + c.concentrationUm).toLowerCase();
    if (currentUm !== this.UM)
      for (let ctItem of this.conversionTable) {
        if (ctItem.um.toLowerCase() === currentUm) {
          c.concentrationUm = this.UM;
          let value = parseFloat(c.concentrationValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;
          c.concentrationValue = '' + value;
        }
      }
  }

  public cancel(): void {
    this.emitter.emit({ response: CANCEL });
  }

  private loadConversionTable(): void {
    let s = this.geoModelsService.getConversionTable().subscribe(
      (res: any) => {
        this.conversionTable = res;
        s.unsubscribe();
      }
    );
  }
}
