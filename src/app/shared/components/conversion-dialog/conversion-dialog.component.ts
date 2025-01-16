import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ConversionTable } from 'src/app/models/conversion';
import { GeoModelsService } from 'src/app/services/rest/geo-models.service';
import { CANCEL, CONFIRM } from '../../modals/modal-params';
import { Computable } from 'src/app/geo-modelling/mixing/mixing.component';

@Component({
  selector: 'app-conversion-dialog',
  templateUrl: './conversion-dialog.component.html',
  styleUrls: ['./conversion-dialog.component.scss']
})
export class ConversionDialogComponent implements OnInit {
  public conversionTable = new Array<ConversionTable>();
  private computables = new Array<Computable>();
  public emitter = new EventEmitter<any>();
  public UM = '';
  @Input() params: any; 

  constructor(private geoModelsService: GeoModelsService) { }

  ngOnInit(): void {
    this.loadConversionTable();
    this.computables = this.params.computables;
    // console.log(this.params);
    // console.log(this.computables);
    console.log(this.conversionTable);
  }

  public confirm(): void {
    for (let c of this.computables) {
      let currentUm = ('' + c.elementUm).toLowerCase();
      if (currentUm === this.UM) 
        continue;
      for (let ctItem of this.conversionTable) {
        if (ctItem.um === currentUm) {
          c.elementUm = this.UM;
          let value = parseFloat(c.elementValue) * ctItem.toPPM;
          if (this.UM === 'wt%')
            value /= 10000;          
          c.elementValue = '' + value;
        }
      }
    }
    this.emitter.emit({ response: CONFIRM, data: this.computables } );
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
