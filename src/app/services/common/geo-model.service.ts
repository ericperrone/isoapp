import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MixingComponent } from 'src/app/geo-modelling/mixing/mixing.component';

export enum ModelList {
  Mixing = 0,
  MassBalance,
  Melting
}

export interface DataType {
  type: ''
}

export interface GeoModel {
  selectedModel: number;
  fieldTypes: 
  endMembers: Array<Array<string>>;
}

@Injectable({
  providedIn: 'root'
})
export class GeoModelService {
  private model: GeoModel | undefined;

  constructor(private modalService: NgbModal) { }

  public setModel(model: GeoModel): void {
    this.model = model;
  }

  public execute() {
    if (!!this.model) {
      switch (this.model.selectedModel) {
        case ModelList.Mixing:
          let ref = this.modalService.open(MixingComponent,  { centered: true, size: 'sm', scrollable: true });
          break;
        default:
          break;  
      }
    }
  }
}
