import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MixingComponent } from 'src/app/geo-modelling/mixing/mixing.component';
import { StoreService } from './store.service';
import { DataSeries } from 'src/app/models/series';
import { PlottingComponent } from 'src/app/geo-modelling/plotting/plotting.component';
// import { OUT_RESULT } from 'src/app/geo-modelling/mixing/mixing.component';

export enum ModelList {
  Mixing = 0,
  Plotting,
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
  series?: DataSeries;
  endMembers?: Array<Array<EndMemberItem>>;
  modalRef?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeoModelService {
  private model: GeoModel | undefined;

  constructor(private modalService: NgbModal,
    private storeService: StoreService) { }

  public setModel(model: GeoModel): void {
    this.model = model;
  }

  public execute(): any {
    if (!!this.model) {
      switch (this.model.selectedModel) {
        case ModelList.Mixing:
          // this.storeService.clean(OUT_RESULT);
          let ref = this.modalService.open(MixingComponent,  { fullscreen: true, windowClass: 'background-white' });
          this.model.modalRef = ref;
          ref.componentInstance.params = this.model;
          return ref;
          break;
        case ModelList.Plotting:
          let ref1 = this.modalService.open(PlottingComponent,  { fullscreen: true, windowClass: 'background-white' }); 
          this.model.modalRef = ref1;
          ref1.componentInstance.params = this.model;
          return ref1;
        default:
          break;  
      }
    }
  }
}
