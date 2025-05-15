import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams, ExclusiveChoice, CONFIRM, CANCEL } from '../modal-params';
import { SampleService } from 'src/app/services/rest/sample.service';


@Component({
  selector: 'app-grid-item-contextmenu',
  templateUrl: './grid-item-contextmenu.component.html',
  styleUrls: ['./grid-item-contextmenu.component.scss']
})
export class GridItemContextmenuComponent implements OnInit {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private sampleService: SampleService) { }

  ngOnInit(): void {
    let s = this.sampleService.getSampleAttribute(parseInt('' + this.params?.id), '' + this.params?.headerText).subscribe(
      (res: any) => {
        console.log(res);
      }
    );
  }

  public emit(value: string) {
    this.emitter.emit(value);
  }

}
