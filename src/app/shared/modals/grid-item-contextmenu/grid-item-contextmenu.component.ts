import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams, ExclusiveChoice, CONFIRM, CANCEL } from '../modal-params';


@Component({
  selector: 'app-grid-item-contextmenu',
  templateUrl: './grid-item-contextmenu.component.html',
  styleUrls: ['./grid-item-contextmenu.component.scss']
})
export class GridItemContextmenuComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public emit(value: string) {
    this.emitter.emit(value);
  }

}
