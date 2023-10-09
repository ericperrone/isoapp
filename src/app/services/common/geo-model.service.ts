import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MixingComponent } from 'src/app/geo-modelling/mixing/mixing.component';

export enum ModelList {
  Mixing = 0,
  MassBalance,
  Melting
}

export interface EndMemberItem {
  type: string;
  name: string;
  value: string;
  selected?: boolean;
}

export interface GeoModel {
  selectedModel: number;
  endMembers: Array<Array<EndMemberItem>>;
  modalRef?: any;
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
          let ref = this.modalService.open(MixingComponent,  { fullscreen: true });
          // let ref = this.modalService.open(MixingComponent,  { centered: true, size: 'lg' });
          this.model.modalRef = ref;
          ref.componentInstance.params = this.model;
          break;
        default:
          break;  
      }
    }
  }
}
