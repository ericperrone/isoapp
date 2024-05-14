import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CANCEL, CONFIRM, ModalParams } from '../modal-params';

export interface NormFactor {
  'Li': number;
  'B': number;
  'Sc': number;
  'V': number;
  'Cr': number;
  'Co': number;
  'Ni': number;
  'Cu': number;
  'Zn': number;
  'Ga': number;
  'Ge': number;
  'As': number;
  'Se': number;
  'Cs': number;
  'Rb': number;
  'Ba': number;
  'Th': number;
  'U': number;
  'Nb': number;
  'Ta': number;
  'La': number;
  'Ce': number;
  'Pb': number;
  'Pr': number;
  'Sr': number;
  'Nd': number;
  'Sm': number;
  'Zr': number;
  'Hf': number;
  'Eu': number;
  'Gd': number;
  'Tb': number;
  'Dy': number;
  'Y': number;
  'Ho': number;
  'Er': number;
  'Tm': number;
  'Yb': number;
  'Lu': number;
  'Mo': number;
  'Pd': number;
  'Ag': number;
  'Cd': number;
  'In': number;
  'Sn': number;
  'Sb': number;
  'W': number;
  'Re': number;
  'Os': number;
  'Ir': number;
  'Pt': number;
  'Au': number;
  'Hg': number;
  'Tl': number;
  'Bi': number;
}

export interface NormItem {
  element: string;
  value: number;
  position: number;
  excluded: boolean;
}

@Component({
  selector: 'app-spider-normalization',
  templateUrl: './spider-normalization.component.html',
  styleUrls: ['./spider-normalization.component.scss']
})
export class SpiderNormalizationComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public normName = '';
  public order = ['Li', 'B', 'Sc', 'V', 'Cr', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Cs', 'Rb', 'Ba', 'Th', 'U', 'Nb', 'Ta', 'La', 'Ce', 'Pb', 'Pr', 'Sr', 'Nd', 'Sm', 'Zr', 'Hf', 'Eu', 'Gd', 'Tb', 'Dy', 'Y', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Mo', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Bi']
  public normItemList = new Array<NormItem>();
  public disabled = true;

  constructor() { }

  ngOnInit(): void {
    this.normItemList = new Array<NormItem>();
    for (let i = 0; i < this.order.length; i++) {
      this.normItemList.push({element: this.order[i], value: 0, position: i + 1, excluded: false});
    }
    this.onModelChange();
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    this.emitter.emit(CONFIRM);
  }

  onModelChange(): void {
    if (this.normName.length <= 0) {
      this.disabled = true;
      return;
    }

    let atLeast = 0;
    let sum = 0;
    for (let item of this.normItemList) {
      sum += item.value;
      if (!item.excluded)
        atLeast++;
    }

    if (sum <= 0 || atLeast <= 0)
      this.disabled = true;
    else 
      this.disabled = false;
      
  }

}
